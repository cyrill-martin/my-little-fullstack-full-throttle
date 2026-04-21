export const useMenus = () => {
  const { getItems } = useDirectus();
  const { getFilter } = usePreview();

  const {
    data: menus,
    pending,
    error,
  } = useAsyncData(
    "menus",
    () =>
      getItems("menus", {
        filter: { ...getFilter(null) },
        fields: [
          "internal_name",
          "translations.custom_title",
          "translations.languages_code",
          "page.translations.title",
          "page.translations.path",
          "page.translations.languages_code",
          "items.page.translations.title",
          "items.page.translations.path",
          "items.page.translations.languages_code",
          "items.translations.label",
          "items.translations.external_url",
          "items.translations.languages_code",
        ],
        deep: {
          items: { _sort: ["sort"] },
        },
      }),
    { dedupe: "defer" },
  );

  return { menus, pending, error };
};
