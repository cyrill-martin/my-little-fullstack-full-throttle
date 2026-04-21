<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>();

const handleBack = () => clearError({ redirect: "/de/home" });
</script>

<template>
  <div>
    <h1>{{ props.error.statusCode }}</h1>
    <p>{{ props.error.message }}</p>
    <button @click="handleBack">Back to home</button>
  </div>
</template>
