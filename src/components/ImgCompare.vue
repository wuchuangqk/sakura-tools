<template>
  <div ref="viewportRef" class="h-full relative select-none overflow-hidden">
    <div class="w-full h-full">
      <img v-if="before" :src="before" alt="" class="img">
    </div>
    <div class=" absolute top-0 bottom-0 w-full h-full overflow-hidden" :style="{ left: imgLayoutLeft + '%' }">
      <img v-if="after" :src="after" alt="" class="img absolute" :style="{ left: (-imgLayoutLeft) + '%' }">
    </div>
    <div ref="handleRef" class="w-2 bg-white/80 absolute top-0 bottom-0 cursor-e-resize handler"
      :style="{ left: handleLeftFmt }" @mousedown="onMouseDown">
      <div class=" absolute tag -left-60">原图</div>
      <div class=" absolute tag left-10">压缩后</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { throttle } from 'lodash'

defineProps<{
  before: string,
  after: string
}>()

const viewportRef = ref(null as unknown as HTMLElement)
const handleRef = ref(null as unknown as HTMLElement)
const handleLeft = ref(0)
let originX = 0
let handleLeftOrigin = 0
const viewportWidth = ref(0)
let handleWidth = 0

const mousemove = throttle((event: MouseEvent) => {
  const moveX = originX - event.pageX
  if (moveX > 0) {
    // 向左
    if (handleLeftOrigin - moveX < 0) {
      handleLeft.value = 0
    } else {
      handleLeft.value = handleLeftOrigin - moveX
    }
  } else {
    // 向右
    if (handleLeftOrigin + Math.abs(moveX) > viewportWidth.value) {
      handleLeft.value = viewportWidth.value
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
const init = () => {
  viewportWidth.value = viewportRef.value.getBoundingClientRect().width
  handleWidth = handleRef.value.getBoundingClientRect().width
  handleLeft.value = viewportWidth.value / 2
}
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
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

.handler {
  box-shadow: 0 0 10px rgba(0, 0, 0, 1);
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