<script setup lang="ts">
import type { BlockLinkItem } from "~/composables/usePage";

const props = defineProps<{ block: BlockLinkItem }>();
</script>
<template>
  <div>
    <pre>{{ props.block }}</pre>
  </div>
</template>
