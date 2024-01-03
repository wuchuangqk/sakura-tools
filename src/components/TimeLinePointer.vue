<template>
  <svg class=" absolute top-0 bottom-0 h-full move"  :style="{ left, width: '1px' }">
    <line x1="0" y1="0" x2="0" y2="130" style="stroke:red;stroke-width:1" />
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

<style lang="scss" scoped>
.move {
  transition: left 0.05s linear;
}
</style>