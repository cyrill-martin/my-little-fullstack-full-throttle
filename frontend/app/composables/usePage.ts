//
export interface Page {
  id: number;
  internal_name: string;
  parent: {
    translations: Array<{
      languages_code: string;
      title: string;
      slug: string;
      path: string;
    }>;
  } | null;
  translations: Array<{
    languages_code: string;
    title: string;
    slug: string;
    path: string;
  }>;
  blocks: PageBlock[];
  seo: PageSeo | null;
}

// The following interfaces represent the structure of the blocks as returned by Directus, including the related item and its translations. This allows us to have proper typing for the block data in our components.
export interface PageBlock {
  id: number;
  collection: "block_richtext" | "block_link";
  item: BlockRichtextItem | BlockLinkItem;
}

export interface BlockRichtextItem {
  id: number;
  status: string;
  internal_name: string;
  translations: Array<{ languages_code: string; content: string }>;
}

export interface BlockLinkItem {
  id: number;
  status: string;
  internal_name: string;
  page: number;
  translations: Array<{ languages_code: string; link_text: string }>;
}

// The PageSeo interface represents the structure of the SEO data for a page, including translations for the SEO fields.
export interface PageSeo {
  id: number;
  image: string | null;
  translations: Array<{
    languages_code: string;
    title: string;
    description: string;
    keywords: string;
  }>;
}

// This composable fetches a single page from Directus based on path and locale
export const usePage = (path: Ref<string>, directusLocale: Ref<string>) => {
  const { getItems } = useDirectus();
  const { getFilter } = usePreview();
  const { pagesId } = usePageState();

  const cacheKey = computed(() => `page-${path.value}-${directusLocale.value}`);

  const {
    data: page,
    pending,
    error,
  } = useAsyncData(
    cacheKey,
    () =>
      getItems("pages", {
        filter: {
          ...getFilter(null),
          translations: {
            path: { _eq: path.value },
          },
        },
        fields: [
          // Page fields
          "id",
          "internal_name",
          "translations.*",
          "parent.translations.*",
          // Block fields with related item and translations
          "blocks.*",
          "blocks.item.id",
          "blocks.item.internal_name",
          "blocks.item.page.translations.*",
          "blocks.item.translations.*",
          // SEO fields with translations
          "seo.*",
          "seo.translations.*",
        ],
        // Apply deep filters to fetch only the translations matching the requested locale
        deep: {
          translations: {
            _filter: { languages_code: { _eq: directusLocale.value } },
          },
          seo: {
            translations: {
              _filter: { languages_code: { _eq: directusLocale.value } },
            },
          },
          // Note: deep filter does not work on M2A block relations in Directus,
          // so block translations are filtered client-side in the transform below.
        },
        limit: 1,
      }),
    {
      dedupe: "defer", // reuse cached result during SSR→CSR hydration
      // Filter block translations to the requested locale since Directus
      // cannot apply deep filters across M2A dynamic collection references.
      transform: (pages: Record<string, any>[]): Page[] => {
        const locale = directusLocale.value;
        return pages.map((page) => ({
          ...page,
          blocks: page.blocks?.map((block: Record<string, any>) => ({
            ...block,
            item: block.item
              ? {
                  ...block.item,
                  translations: block.item.translations?.filter(
                    (t: Record<string, any>) => t.languages_code === locale,
                  ),
                  page: block.item.page
                    ? {
                        ...block.item.page,
                        translations: block.item.page.translations?.filter(
                          (t: Record<string, any>) =>
                            t.languages_code === locale,
                        ),
                      }
                    : block.item.page,
                }
              : block.item,
          })),
        })) as Page[];
      },
    },
  );

  // Set the page ID in the state for use in the language switch component and elsewhere
  watch(
    page,
    (val) => {
      pagesId.value = val?.[0]?.id ?? null;
    },
    { immediate: true },
  );

  return { page, pending, error };
};
