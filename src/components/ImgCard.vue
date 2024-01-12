<template>
  <div class="w-[150px]" :class="{ selected }">
    <div class="h-[150px]">
      <img :src="img.path" alt="" class="w-full h-full object-cover">
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  img: IImg,
  selected: boolean
}>()
</script>

<style lang="scss" scoped>
.selected {
  border: 1px solid red;
}
</style>