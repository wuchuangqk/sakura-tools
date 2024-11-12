<template>
  <div class="h-full relative flex flex-col">
    <div class="flex items-center">
      <div class="w-[150px] mr-6 px-10">
        <Slider v-model:value="ratio" :max="5" :min="1" :step="1" />
      </div>
      <div>放大倍数：{{ ratio }}</div>
    </div>
    <div class="d1 flex-1">
      <div class="d2">
        <div class=" absolute left-4 top-4 px-8 py-4 bg-black/80 z-[1] shadow">原图</div>
        <img ref="img" :src="compressInfo.file.path" alt="" class="img" :style="imgStyle">
      </div>
      <div class="d2">
        <div class=" absolute left-4 top-4 px-8 py-4 bg-black/80 z-[1] shadow">压缩后({{ compressInfo.quality }}%)</div>
        <img :src="compressInfo.compressedImgPath" alt="" class="img" :style="imgStyle">
      </div>
    </div>
    <MiniMap :img="compressInfo.file.path" :ratio="ratio" @update="onUpdate" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import MiniMap from './MiniMap.vue';
import { ImgCompress } from '@/renderer/util';

defineProps<{
  compressInfo: ImgCompress
}>()

const img = ref<HTMLImageElement>(null as unknown as HTMLImageElement)
const ratio = ref(1)
const imgStyle = computed(() => {
  let width = 0
  let height = 0
  if (img.value) {
    width = img.value.offsetWidth
    height = img.value.offsetHeight
  }
  const scaleX = width * (ratio.value - 1) / 2
  const scaleY = height * (ratio.value - 1) / 2
  return {
    transform: `scale(${ratio.value})`,
    left: scaleX * (1 - 2 * minimapPercent.x) + 'px',
    top: scaleY * (1 - 2 * minimapPercent.y) + 'px'
  }
})

const minimapPercent = reactive({
  x: 0,
  y: 0,
})

const onUpdate = ({ x, y }: { x: number, y: number }) => {
  minimapPercent.x = x
  minimapPercent.y = y
}
</script>

<style scoped>
.d1 {
  display: flex;
  gap: 10px;
}

.d2 {
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
  /* background-color: bisque; */
}

.d2:last-of-type {
  /* background-color: cadetblue; */
}

.img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
