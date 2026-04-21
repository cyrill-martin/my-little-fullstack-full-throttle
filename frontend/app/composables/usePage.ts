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
          "*",
          "translations.*",
          "blocks.id",
          "blocks.collection",
          "blocks.item.*",
          "blocks.item.translations.*",
        ],
        deep: {
          translations: {
            _filter: { languages_code: { _eq: directusLocale.value } },
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
      transform: (pages) => {
        const locale = directusLocale.value;
        return pages.map((page: any) => ({
          ...page,
          blocks: page.blocks?.map((block: any) => ({
            ...block,
            item: block.item
              ? {
                  ...block.item,
                  translations: block.item.translations?.filter(
                    (t: any) => t.languages_code === locale,
                  ),
                }
              : block.item,
          })),
        }));
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
