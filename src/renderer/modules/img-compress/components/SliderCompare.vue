<template>
  <div class="h-full flex flex-col relative overflow-hidden">
    <div class="flex items-center">
      <div class="w-[150px] mr-6 px-10">
        <Slider v-model:value="ratio" :max="5" :min="1" :step="1" />
      </div>
      <div>放大倍数：{{ ratio }}</div>
    </div>
    <div ref="viewportRef" class="flex-1 relative select-none overflow-hidden">
      <div class="w-full h-full relative">
        <img v-if="compressInfo.file.path" ref="imgRef" :src="compressInfo.file.path" alt="" class="img"
          :style="imgStyle">
      </div>
      <div ref="parentRef" class=" absolute top-0 bottom-0 w-full h-full overflow-hidden"
        :style="{ left: imgLayoutLeft + '%' }">
        <img v-if="compressInfo.compressedImgPath" :src="compressInfo.compressedImgPath" alt="" class="img absolute"
          :style="imgStyle2">
      </div>
      <div ref="handleRef" class="w-12 absolute top-0 bottom-0 cursor-e-resize" :style="{ left: handleLeftFmt }"
        @mousedown="onMouseDown">
        <div class="bg-white/80 w-2 h-full mx-auto handler"></div>
        <div class=" absolute tag -left-60">原图</div>
        <div class=" absolute tag left-20">压缩后({{ compressInfo.quality }}%)</div>
      </div>
    </div>
    <MiniMap :img="compressInfo.file.path" :ratio="ratio" @update="onUpdate" />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch, useTemplateRef } from 'vue'
import { throttle } from 'lodash'
import MiniMap from './MiniMap.vue';
import { ImgCompress } from '@/renderer/util';

const props = defineProps<{
  compressInfo: ImgCompress
}>()

const viewportRef = ref(null as unknown as HTMLElement)
const handleRef = ref(null as unknown as HTMLElement)
const handleLeft = ref(0)
let originX = 0
let handleLeftOrigin = 0
const viewportWidth = ref(0)
let handleWidth = 0
const safeArea = 10 // 距离两边的距离，防止竖条跑到外面
const minimapPercent = reactive({
  x: 0,
  y: 0,
})
const ratio = ref(1)

const imgRef = useTemplateRef('imgRef')
const parentRef = useTemplateRef('parentRef')

const onUpdate = ({ x, y }: { x: number, y: number }) => {
  minimapPercent.x = x
  minimapPercent.y = y
}
const mousemove = throttle((event: MouseEvent) => {
  const moveX = originX - event.pageX
  if (moveX > 0) {
    // 向左
    if (handleLeftOrigin - moveX < safeArea) {
      handleLeft.value = safeArea
    } else {
      handleLeft.value = handleLeftOrigin - moveX
    }
  } else {
    // 向右
    if (handleLeftOrigin + Math.abs(moveX) > (viewportWidth.value - safeArea)) {
      handleLeft.value = viewportWidth.value - safeArea
    } else {
      handleLeft.value = handleLeftOrigin + Math.abs(moveX)
    }
  }
}, 50)
const mouseup = () => {
  document.removeEventListener('mousemove', mousemove)
  document.removeEventListener('mouseup', mouseup)
}
const onMouseDown = (event: MouseEvent) => {
  originX = event.pageX
  handleLeftOrigin = handleLeft.value
  document.addEventListener('mousemove', mousemove)
  document.addEventListener('mouseup', mouseup)
}
const handleLeftFmt = computed(() => {
  return (handleLeft.value - handleWidth / 2) + 'px'
})
const imgLayoutLeft = computed(() => {
  if (viewportWidth.value === 0) {
    return 50
  } else {
    return handleLeft.value / viewportWidth.value * 100
  }
})
const imgStyle = computed(() => {
  let width = 0
  let height = 0
  if (imgRef.value) {
    width = imgRef.value.offsetWidth
    height = imgRef.value.offsetHeight
  }
  const scaleX = width * (ratio.value - 1) / 2
  const scaleY = height * (ratio.value - 1) / 2
  return {
    transform: `scale(${ratio.value})`,
    left: scaleX * (1 - 2 * minimapPercent.x) + 'px',
    top: scaleY * (1 - 2 * minimapPercent.y) + 'px'
  }
})
const imgStyle2 = computed(() => {
  let width = 0
  let height = 0
  if (imgRef.value) {
    width = imgRef.value.offsetWidth
    height = imgRef.value.offsetHeight
  }
  const scaleX = width * (ratio.value - 1) / 2
  const scaleY = height * (ratio.value - 1) / 2
  let offsetLeft = 0
  if (parentRef.value) {
    offsetLeft = parentRef.value.offsetWidth * imgLayoutLeft.value / 100
  }
  return {
    transform: `scale(${ratio.value})`,
    left: scaleX * (1 - 2 * minimapPercent.x) - offsetLeft + 'px',
    top: scaleY * (1 - 2 * minimapPercent.y) + 'px'
  }
})

const init = () => {
  viewportWidth.value = viewportRef.value.getBoundingClientRect().width
  handleWidth = handleRef.value.getBoundingClientRect().width
  handleLeft.value = viewportWidth.value / 2
}
watch(() => props.compressInfo, () => init())
onMounted(() => {
  init()
  window.addEventListener('resize', init)
})
onUnmounted(() => {
  window.removeEventListener('resize', init)
})
</script>

<style lang="scss" scoped>
.img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

.handler {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
}

.tag {
  background: rgba(223, 226, 255, 0.1);
  border: 1px solid rgba(223, 226, 255, 0.5);
  backdrop-filter: blur(5px);
  border-radius: 100px;
  color: #FFFFFF;
  font-size: 10px;
  top: 50px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
}
</style>