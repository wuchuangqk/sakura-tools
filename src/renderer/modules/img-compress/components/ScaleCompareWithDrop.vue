<template>
  <div class="h-full relative flex flex-col">
    <div class="flex items-center">
      <div class="w-[150px] mr-6 px-10">
        <Slider v-model:value="ratio" :max="5" :min="1" :step="1" />
      </div>
      <div>放大倍数：{{ ratio }}</div>
    </div>
    <div class="d1 flex-1">
      <div class="d2" ref="imgWrapRef">
        <div class=" absolute left-4 top-4 px-8 py-4 bg-black/80 z-[1] shadow">图1</div>
        <DropImg :imgStyle="imgStyle" @droped="(path) => miniMapImg = path" />
      </div>
      <div class="d2">
        <div class=" absolute left-4 top-4 px-8 py-4 bg-black/80 z-[1] shadow">图2</div>
        <DropImg :imgStyle="imgStyle" />
      </div>
    </div>
    <MiniMap v-if="miniMapImg" :img="miniMapImg" :ratio="ratio" @update="onUpdate" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef } from 'vue';
import MiniMap from './MiniMap.vue';
import DropImg from './DropImg.vue';

const imgWrapRef = useTemplateRef('imgWrapRef')
const ratio = ref(1)
const miniMapImg = ref('')
const minimapPercent = reactive({
  x: 0,
  y: 0,
})

const imgStyle = computed(() => {
  let width = 0
  let height = 0
  if (imgWrapRef.value) {
    width = imgWrapRef.value.offsetWidth
    height = imgWrapRef.value.offsetHeight
  }
  const scaleX = width * (ratio.value - 1) / 2
  const scaleY = height * (ratio.value - 1) / 2
  return {
    transform: `scale(${ratio.value})`,
    left: scaleX * (1 - 2 * minimapPercent.x) + 'px',
    top: scaleY * (1 - 2 * minimapPercent.y) + 'px'
  }
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
</style>
