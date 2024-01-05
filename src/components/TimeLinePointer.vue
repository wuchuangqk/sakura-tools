<template>
  <svg v-if="type === 'command'" class=" absolute top-0 bottom-0 h-full move" :style="{ left, width: '2px' }">
    <line x1="0" y1="0" x2="0" y2="130" style="stroke-width:2;stroke: blue;" />
  </svg>
  <svg v-if="type === 'preview'" class=" absolute top-0 bottom-0 h-full move" :style="{ left, width: '2px' }">
    <line x1="0" y1="0" x2="0" y2="106" style="stroke-width:2;stroke: white;" />
  </svg>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  left: string,
  type?: string, // command|preview
}>(), {
  left: '0',
  type: 'command',
})

</script>

<style lang="scss" scoped>
.move {
  transition: left 0.05s linear;
}
</style>