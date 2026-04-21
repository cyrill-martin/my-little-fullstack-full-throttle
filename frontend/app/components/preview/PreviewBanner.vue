<script setup lang="ts">
// This is the preview banner shown on top of each page if the site is in preview mode
const { isPreview } = usePreview();
const route = useRoute();
</script>

<template>
  <div class="preview-banner" v-if="isPreview">PREVIEW - {{ route.path }}</div>
</template>

<style lang="css" scoped>
.preview-banner {
  background: var(--color-primary, orange);
  padding: 10px;
  text-align: center;
}
</style>
