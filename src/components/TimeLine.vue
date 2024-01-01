<template>
  <div style="height: 50px;">
    <div class="flex">
      <img v-for="thumbnail in thumbnails" :key="thumbnail.url" :src="thumbnail.url" alt="" style="height: 50px;">
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