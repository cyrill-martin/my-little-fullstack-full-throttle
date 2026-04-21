// composables/usePreviewRedirect.ts
export const usePreviewRedirect = async (
  id: Ref<string>,
  locale: Ref<string>,
  directusLocale: Ref<string>,
) => {
  const { getItems } = useDirectus();

  // Must be awaited so translation.value is populated before the caller checks it
  const { data: translation } = await useAsyncData(
    `preview-redirect-${id.value}-${locale.value}`,
    () =>
      getItems("pages_translations", {
        filter: {
          pages_id: { _eq: id.value },
          languages_code: { _eq: directusLocale.value },
        },
        fields: ["path"],
        limit: 1,
      }).then((res) => res[0] ?? null),
  );

  return { translation };
};
