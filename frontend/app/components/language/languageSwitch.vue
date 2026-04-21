<script setup lang="ts">
const { locale } = useI18n();
const { pagesId } = usePageState();
const { localeLinks } = useLanguageSwitch(pagesId);
import { toDirectusLocale } from "~/composables/useDirectusLocale";
const { isPreview } = usePreview();

const isGerman = computed(() => locale.value === "de");

const languagePath = (loc: string) => {
  const obj = localeLinks.value?.find(
    (link) => link.languages_code === toDirectusLocale(loc),
  );

  if (!obj) {
    return "";
  }

  return isPreview.value ? obj.path + "?preview=true" : obj.path;
};
</script>

<template>
  <div v-if="pagesId">
    <NuxtLink :to="`/de${languagePath('de')}`" :class="{ active: isGerman }"
      >DE</NuxtLink
    >
    |
    <NuxtLink :to="`/en${languagePath('en')}`" :class="{ active: !isGerman }"
      >EN</NuxtLink
    >
  </div>
</template>

<style lang="css" scoped>
a.active {
  font-weight: 700;
  cursor: default;
}
</style>
