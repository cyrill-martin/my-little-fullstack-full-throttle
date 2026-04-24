<script setup lang="ts">
const route = useRoute();
const { directusLocale } = useDirectusLocale();

const path = computed(() => {
  const slugArray = route.params.slug as string[];
  return `/${slugArray.join("/")}`;
});

const { page, pending, error } = usePage(path, directusLocale);

watchEffect(() => {
  if (
    !pending.value &&
    !error.value &&
    (!page.value || page.value.length === 0)
  ) {
    throw createError({ statusCode: 404, fatal: true });
  }
});
</script>

<template>
  <div>
    <h1>Menu</h1>
    <Menu menu="main_menu" />
  </div>
  <div>
    <h1>Page</h1>
    <div v-if="pending">Loading...</div>

    <div v-else-if="error">Error: {{ error.message }}</div>

    <div v-else-if="page && page.length > 0">
      <pre>{{ page }}</pre>
    </div>
  </div>
</template>
