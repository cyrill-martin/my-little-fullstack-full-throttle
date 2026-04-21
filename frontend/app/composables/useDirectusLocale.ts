export const toDirectusLocale = (nuxtLocale: string): string => {
  const localeMap: Record<string, string> = {
    de: "de-CH",
    en: "en-US",
  };
  return localeMap[nuxtLocale] ?? "de-CH";
};

export const useDirectusLocale = (localeOverride?: Ref<string>) => {
  const { locale } = useI18n();

  // Use the override when provided (e.g. on routes excluded from i18n like /preview)
  const activeLocale = localeOverride ?? locale;
  const directusLocale = computed(() => toDirectusLocale(activeLocale.value));

  return { directusLocale };
};
