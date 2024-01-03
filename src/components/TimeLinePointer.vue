<template>
  <svg class=" absolute top-0 bottom-0 h-full" :style="{left, width: '4px'}">
    <line x1="0" y1="0" x2="0" y2="50" style="stroke:red;stroke-width:4" />
  </svg>
</template>
<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  left: string,
}>(), {
  left: '0'
})
</script>

<style lang="scss" scoped></style>