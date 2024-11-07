<script setup lang="ts">
import { computed } from 'vue';
import { onBeforeUnmount } from 'vue';
import { onMounted } from 'vue';
import { reactive } from 'vue';
import { ref } from 'vue'
import { throttle } from 'lodash'
defineProps<{
  original: string,
  after: string
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

const minimapRef = ref<HTMLDivElement>(null as unknown as HTMLImageElement)
const viewportRef = ref<HTMLDivElement>(null as unknown as HTMLImageElement)
const viewportPosition = reactive({
  left: 0,
  top: 0,
})
const minimapPercent = reactive({
  x: 0,
  y: 0,
})
const viewportStyle = computed(() => {
  let parentWidth
  let parentHeight
  if (minimapRef.value) {
    parentWidth = minimapRef.value.offsetWidth
    parentHeight = minimapRef.value.offsetHeight
  } else {
    parentWidth = 0
    parentHeight = 0
  }
  const width = parentWidth / ratio.value
  const height = parentHeight / ratio.value
  if (viewportPosition.left + width > parentWidth) {
    viewportPosition.left = parentWidth - width
  }
  if (viewportPosition.top + height > parentHeight) {
    viewportPosition.top = parentHeight - height
  }
  return {
    width: width + 'px',
    height: height + 'px',
    left: viewportPosition.left + 'px',
    top: viewportPosition.top + 'px',
  }
})


let removeListener: Function
const addListener = () => {
  let flag = false
  let x = 0
  let y = 0
  let left = 0
  let top = 0
  const parentWidth = minimapRef.value.offsetWidth
  const parentHeight = minimapRef.value.offsetHeight

  const onMousedown = (event: MouseEvent) => {
    flag = true
    x = event.clientX
    y = event.clientY
    left = viewportRef.value.offsetLeft
    top = viewportRef.value.offsetTop
  }
  const onMousemove = throttle((event: MouseEvent) => {
    if (!flag) return
    // 相对于原点的偏移
    const moveX = event.clientX - x
    const moveY = event.clientY - y
    const width = viewportRef.value.offsetWidth
    const height = viewportRef.value.offsetHeight
    let l = left + moveX
    let t = top + moveY
    if (l < 0) {
      l = 0
    } else if (l + width > parentWidth) {
      l = parentWidth - width
    }
    if (t < 0) {
      t = 0
    } else if (t + height > parentHeight) {
      t = parentHeight - height
    }
    if (parentWidth - width === 0) {
      minimapPercent.x = 0
    } else {
      minimapPercent.x = l / (parentWidth - width)
    }
    if (parentHeight - height === 0) {
      minimapPercent.y = 0
    } else {
      minimapPercent.y = t / (parentHeight - height)
    }
    viewportPosition.left = l
    viewportPosition.top = t
  }, 16)
  const onMouseup = () => {
    flag = false
  }
  removeListener = () => {
    viewportRef.value.removeEventListener('mousedown', onMousedown)
    document.removeEventListener('mousemove', onMousemove)
    document.removeEventListener('mouseup', onMouseup)
  }
  viewportRef.value.addEventListener('mousedown', onMousedown)
  document.addEventListener('mousemove', onMousemove)
  document.addEventListener('mouseup', onMouseup)
}

onMounted(() => {
  addListener()
})
onBeforeUnmount(() => {
  removeListener()
})
</script>

<template>
  <div>
    <div class="d1">
      <div class="d2">
        <img ref="img" :src="original" alt="" class="img" :style="imgStyle">
      </div>
      <div class="d2">
        <img :src="after" alt="" class="img" :style="imgStyle">
      </div>
    </div>
    <button @click="ratio = 1">原始尺寸</button>
    <button @click="ratio = 1.5">放大1.5</button>
    <button @click="ratio = 2">放大2</button>
    <div ref="minimapRef" class="minimap">
      <img :src="original" alt="" class="img">
      <div class="mask"></div>
      <div ref="viewportRef" class="viewport" :style="viewportStyle"></div>
    </div>
  </div>
</template>

<style scoped>
.d1 {
  display: flex;
  gap: 10px;
  height: 400px;
}

.d2 {
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
  background-color: bisque;
}

.d2:last-of-type {
  background-color: cadetblue;
}

.img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.minimap {
  position: relative;
  width: 300px;
  height: 200px;
}

.mask {
  position: absolute;
  z-index: 1;
}

.viewport {
  position: absolute;
  z-index: 2;
  border: 1px solid #333;
  box-sizing: border-box;
  background-color: rgba(255, 228, 196, 0.548);
  cursor: move;
  user-select: none
}
</style>
