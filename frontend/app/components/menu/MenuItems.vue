<script setup lang="ts">
const { menus, pending, error } = useMenus();

const props = defineProps({
  menu: { type: String, required: true },
});

const menu = computed(() => {
  return menus.value?.find((m) => m.internal_name === props.menu);
});
</script>

<template>
  <div v-if="pending">Loading...</div>

  <div v-else-if="error">Error: {{ error.message }}</div>

  <div v-else-if="menu">
    <pre>{{ menu }}</pre>
  </div>
</template>
