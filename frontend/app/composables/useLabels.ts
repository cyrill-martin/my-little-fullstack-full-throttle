// This composable fetches translated labels from Directus
export const useLabels = async () => {
  const { getItems } = useDirectus();
  const { directusLocale } = useDirectusLocale();
  const { locale } = useI18n();

  const cacheKey = computed(() => `labels-${locale.value}`);

  const { data: labels } = await useAsyncData(
    cacheKey.value,
    () =>
      getItems("labels", {
        fields: ["*", "translations.*"],
        deep: {
          translations: {
            _filter: { languages_code: { _eq: directusLocale.value } },
          },
        },
      }),

    { watch: [locale] }, // The built-in watch option allows automatically rerunning the fetcher function when any changes are detected
  );

  const label = (key: string) => {
    const label = labels.value?.find((l) => l.key === key);
    return label?.translations?.[0]?.value || key;
  };

  return { label };
};
