<script setup lang="ts">
import BlockRichtext from "~/components/blocks/BlockRichtext.vue";
import BlockLink from "~/components/blocks/BlockLink.vue";

const { editableAttr, applyEditor } = useVisualEditor();
const route = useRoute();
const { directusLocale } = useDirectusLocale();
const { label } = await useLabels();

const blockComponents: Record<string, Component> = {
  block_richtext: BlockRichtext,
  block_link: BlockLink,
};

// Catch-all route to fetch page data based on the slug
const path = computed(() => {
  const slugArray = route.params.slug as string[];
  return `/${slugArray.join("/")}`;
});

// Fetch page data using the custom usePage composable
const { page, pending, error } = usePage(path, directusLocale);

// If the page is not found, throw a 404 error
watchEffect(() => {
  if (
    !pending.value &&
    !error.value &&
    (!page.value || page.value.length === 0)
  ) {
    throw createError({ statusCode: 404, fatal: true });
  }
});

onMounted(() => {
  if (page.value) applyEditor();
});

watch(
  () => page.value,
  (page) => {
    if (page) applyEditor();
  },
);

// Extract SEO data from the page and use the useSeo composable to set meta tags
const seo = computed(() => page.value?.[0]?.seo);
useSeo(seo);
</script>

<template>
  <div>
    <h1>Label</h1>
    <p
      :data-directus="
        editableAttr({
          collection: 'labels',
          item: 'contact.mail',
          fields: 'translations',
          mode: 'modal',
        })
      "
    >
      {{ label("contact.mail") }}
    </p>
  </div>
  <div>
    <h1>Menu</h1>
    <MenuItems menu="main_menu" />
  </div>
  <div>
    <h1>Complete Page Response</h1>
    <div v-if="pending">Loading...</div>

    <div v-else-if="error">Error: {{ error.message }}</div>

    <div
      v-else-if="page && page.length > 0"
      :data-directus="
        editableAttr({
          collection: 'pages',
          item: 1,
          fields: 'translations',
          mode: 'modal',
        })
      "
    >
      <pre>{{ page }}</pre>
    </div>

    <div v-if="page && page.length > 0">
      <h1>Single Blocks</h1>
      <component
        v-for="block in page[0]?.blocks"
        :key="block.id"
        :is="blockComponents[block.collection]"
        :block="block"
      />
    </div>
  </div>
</template>

<style scoped>
h1 {
  color: var(--color-primary);
}
</style>
