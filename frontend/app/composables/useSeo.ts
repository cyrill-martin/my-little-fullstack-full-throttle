import type { PageSeo } from "./usePage";

// composables/useSeo.js
export const useSeo = (seoRef: Ref<PageSeo | null | undefined>) => {
  const { assetUrl } = useDirectus();

  // Site specific defaults
  const author = "Cyrill Martin - kmapper GmbH";
  const siteName = "kmapper";
  const siteUrl = "https://kmapper.ch";
  const defaultImage = assetUrl("a7e3ff6b-c077-4d0b-a98d-f3f8a30567bd");

  // To do: add defaults for all fields

  useSeoMeta({
    author: author,
    title: () =>
      seoRef.value
        ? `${seoRef.value?.translations?.[0]?.title} - ${siteName}`
        : siteName,
    ogTitle: () => `${seoRef.value?.translations?.[0]?.title} - ${siteName}`,
    description: () => seoRef.value?.translations?.[0]?.description,
    ogDescription: () => seoRef.value?.translations?.[0]?.description,
    keywords: () => seoRef.value?.translations?.[0]?.keywords,
    ogType: "website",
    ogUrl: siteUrl,
    ogImage: () =>
      seoRef.value?.image ? assetUrl(seoRef.value.image) : defaultImage,
    twitterCard: "summary_large_image",
    twitterTitle: () =>
      `${seoRef.value?.translations?.[0]?.title} - ${siteName}`,
    twitterDescription: () => seoRef.value?.translations?.[0]?.description,
    twitterImage: () =>
      seoRef.value?.image ? assetUrl(seoRef.value.image) : defaultImage,
  });
};
