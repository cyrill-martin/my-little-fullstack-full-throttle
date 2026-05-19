<script setup lang="ts">
import type { BlockRichtextItem } from "~/composables/usePage";

const props = defineProps<{ block: BlockRichtextItem }>();
</script>
<template>
  <div>
    <pre>{{ props.block }}</pre>
  </div>
</template>
