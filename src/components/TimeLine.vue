<template>
  <div style="height: 50px;" class="flex">
    <div v-for="thumbnail in thumbnails" :key="thumbnail.url" class="flex-1 pr-1 last-of-type:pr-0">
      <img :src="thumbnail.url" alt="" style="max-width: 100%;" class="h-full object-cover">
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  thumbnails: any[],
}>(), {
  thumbnails: () => []
})
</script>

<style lang="scss" scoped></style>