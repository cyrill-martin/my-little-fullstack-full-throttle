interface MenuTranslation {
  languages_code: string;
  custom_title: string;
}

interface PageTranslation {
  languages_code: string;
  title: string;
  path: string;
}

interface MenuItemTranslation {
  languages_code: string;
  label: string;
  external_url: string;
}

interface MenuItem {
  translations: MenuItemTranslation[];
  page: { translations: PageTranslation[] } | null;
}

export interface Menu {
  internal_name: string;
  translations: MenuTranslation[];
  page: { translations: PageTranslation[] } | null;
  items: MenuItem[];
}

export const useMenus = () => {
  const { getItems } = useDirectus();
  const { getFilter } = usePreview();
  const { directusLocale } = useDirectusLocale();

  const {
    data: menus,
    pending,
    error,
  } = useAsyncData<Menu[]>(
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
      }) as unknown as Promise<Menu[]>,
    { dedupe: "defer" },
  );

  const filteredMenus = computed(() =>
    menus.value?.map((menu) => ({
      ...menu,
      translations: menu.translations?.filter(
        (t) => t.languages_code === directusLocale.value,
      ),
      page: menu.page
        ? {
            ...menu.page,
            translations: menu.page.translations?.filter(
              (t) => t.languages_code === directusLocale.value,
            ),
          }
        : menu.page,
      items: menu.items?.map((item) => ({
        ...item,
        translations: item.translations?.filter(
          (t) => t.languages_code === directusLocale.value,
        ),
        page: item.page
          ? {
              ...item.page,
              translations: item.page.translations?.filter(
                (t) => t.languages_code === directusLocale.value,
              ),
            }
          : item.page,
      })),
    })),
  );

  return { menus: filteredMenus, pending, error };
};
