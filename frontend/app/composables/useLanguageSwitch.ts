export const useLanguageSwitch = (pagesId: Ref<number | null>) => {
  const { getItems } = useDirectus();

  const { data: localeLinks } = useAsyncData(
    () => `locale-links-${pagesId.value}`,
    async () => {
      if (!pagesId.value) return null;
      return getItems("pages_translations", {
        filter: { pages_id: { _eq: pagesId.value } },
        fields: ["languages_code", "path"],
      });
    },
    { watch: [pagesId] },
  );

  return { localeLinks };
};
