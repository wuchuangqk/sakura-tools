<template>
  <div ref="minimapRef" class="minimap shadow">
    <img :src="img" alt="" class="img">
    <div class=" absolute z-[1]"></div>
    <div ref="viewportRef" class="view-handler shadow" :style="viewportStyle"></div>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, useTemplateRef } from 'vue'
import { throttle } from 'lodash'

const { ratio } = defineProps<{
  img: string,
  ratio: number
}>()
const emit = defineEmits<{
  update: [{ x: number, y: number }]
}>()

const minimapRef = useTemplateRef('minimapRef')
const viewportRef = useTemplateRef('viewportRef')

const viewportPosition = reactive({
  left: 0,
  top: 0,
})
const minimapPercent = {
  x: 0,
  y: 0,
}

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
  const width = parentWidth / ratio
  const height = parentHeight / ratio
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
  const parentWidth = minimapRef.value!.offsetWidth
  const parentHeight = minimapRef.value!.offsetHeight

  const onMousedown = (event: MouseEvent) => {
    flag = true
    x = event.clientX
    y = event.clientY
    left = viewportRef.value!.offsetLeft
    top = viewportRef.value!.offsetTop
  }
  const onMousemove = throttle((event: MouseEvent) => {
    if (!flag) return
    // 相对于原点的偏移
    const moveX = event.clientX - x
    const moveY = event.clientY - y
    const width = viewportRef.value!.offsetWidth
    const height = viewportRef.value!.offsetHeight
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
    emit('update', minimapPercent)
  }, 16)
  const onMouseup = () => {
    flag = false
  }
  removeListener = () => {
    viewportRef.value!.removeEventListener('mousedown', onMousedown)
    document.removeEventListener('mousemove', onMousemove)
    document.removeEventListener('mouseup', onMouseup)
  }
  viewportRef.value!.addEventListener('mousedown', onMousedown)
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

<style lang="scss" scoped>
.minimap {
  position: absolute;
  left: 4px;
  bottom: 4px;
  width: 200px;
  height: 150px;

  .img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
    -webkit-user-drag: none;
  }

  .view-handler {
    position: absolute;
    z-index: 2;
    border: 2px solid var(--divider3);
    box-sizing: border-box;
    background-color: rgba(255, 228, 196, 0.7);
    cursor: move;
    user-select: none
  }
}
</style>