<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>();
</script>

<template>
  <div>
    <h1>{{ props.error.statusCode }}</h1>
    <p>{{ props.error.message }}</p>
    <p>
      <a href="http://"></a>
      <NuxtLink :to="'/de/home'">Home</NuxtLink>
    </p>
  </div>
</template>
