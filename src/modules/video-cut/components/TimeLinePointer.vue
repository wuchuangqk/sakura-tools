<template>
  <svg v-if="type === 'command'" class=" absolute top-0 bottom-0 h-full move" :style="{ left, width: '3px' }">
    <line x1="0" y1="0" x2="0" y2="140" style="stroke-width:3;stroke: blue;" />
  </svg>
  <svg v-if="type === 'preview'" class=" absolute top-0 bottom-0 h-full move" :style="{ left, width: '2px' }">
    <line x1="0" y1="0" x2="0" y2="119" style="stroke-width:2;stroke: white;" />
  </svg>
</template>
<script setup lang="ts">

withDefaults(defineProps<{
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