<script setup lang="ts">
// Exclude from i18n prefix routing so Directus can link to /preview directly
defineI18nRoute(false);

const route = useRoute();
const id = ref(route.query.id as string);
const locale = ref((route.query.locale as string) ?? "de");

// Pass locale from query param as override — i18n locale defaults to "de" on this unprefixed route
const { directusLocale } = useDirectusLocale(locale);

const { translation } = await usePreviewRedirect(id, locale, directusLocale);

if (!translation.value?.path) {
  throw createError({ statusCode: 404, statusMessage: "Preview not found" });
}

await navigateTo(`/${locale.value}${translation.value.path}?preview=true`);
</script>

<template>
  <div />
</template>
