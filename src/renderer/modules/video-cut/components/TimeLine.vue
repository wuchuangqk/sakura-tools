<template>
  <div ref="timeLineRef" class="relative flex flex-col bg-[var(--dark4)] pt-20 pb-20 select-none mt-4" @click="click"
    @mousemove="preview" @mouseleave="onMouseleaveTimeLine">
    <ScaleLine class="mb-2" />
    <div class="flex mb-16">
      <span v-for="thumbnail in thumbnailsSorted" :key="thumbnail.time"
        class="flex-1 overflow-hidden text-xs text-gray-500">
        {{ thumbnail.timeFmt }}
      </span>
    </div>
    <div class="flex relative h-40">
      <div v-for="thumbnail in thumbnails" :key="thumbnail.url"
        class="flex-1 overflow-hidden pr-1 last-of-type:pr-0 h-full">
        <img :src="thumbnail.url" alt="" class=" w-full h-full object-cover select-none">
      </div>
    </div>
    <div class=" absolute left-0 right-0 bottom-0 h-20">
      <div v-for="segment in segmentList" :key="segment.start" class="segment"
        :style="{ left: segment.left, width: segment.width }">
        <div class="handler start-handler" @mousedown="() => mousedown(segment, 'start')"></div>
        <div class="handler end-handler" @mousedown="() => mousedown(segment, 'end')"></div>
      </div>
    </div>
    <TimeLinePointer :left="playProgress" />
    <TimeLinePointer v-if="!isPlaying && previewPointer !== playProgress" :left="previewPointer" type="preview" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import TimeLinePointer from './TimeLinePointer.vue';
import ScaleLine from './ScaleLine.vue';
import { Segment } from '@/renderer/util'
import { throttle } from 'lodash'
import Decimal from 'decimal.js';
import { useVideoStore } from '@/renderer/store'
import { storeToRefs } from 'pinia'
import { sortBy } from 'lodash'

const store = useVideoStore()
const { isPlaying, commandTime } = storeToRefs(store)
const videoMeta = store.videoMeta
const segmentList = store.segmentList
const thumbnails = store.thumbnails
const { setCurrentTime } = store.action

const timeLineRef = ref<HTMLElement>(null as unknown as HTMLElement)
let moveSegment: Segment
let moveSegmentIndex: number
let moveType: string
let isStopPreview = false

// 播放进度
const playProgress = computed(() => {
  const { currentTime, duration } = videoMeta
  const time = isPlaying.value ? currentTime : commandTime.value
  const progress = Decimal.div(time, duration).mul(100).toFixed(2) + '%'
  return progress
})

const previewPointer = computed(() => {
  const { currentTime, duration } = videoMeta
  const progress = Decimal.div(currentTime, duration).mul(100).toFixed(2) + '%'
  return progress
})

const thumbnailsSorted = computed(() => sortBy(thumbnails, (thumbnail: { time: number; }) => thumbnail.time)) as unknown as IThumbnail[]

/**
 * 通过鼠标在时间线上落点的位置，来推算出时间点
 */
const getTimeByMousePosition = (event: MouseEvent) => {
  const rect = timeLineRef.value.getBoundingClientRect()
  const relX = event.pageX - (rect.left + document.body.scrollLeft)
  // relX / timeLineRef.value.offsetWidth 是一个百分比，用播放时间乘以百分比，来求出时间点（单位：秒）
  const time = videoMeta.duration * (relX / timeLineRef.value.offsetWidth)
  return time
}

// 手动设置播放进度
const click = (event: MouseEvent) => {
  const time = getTimeByMousePosition(event)
  commandTime.value = time
  setCurrentTime(time)
}

const mousedown = (segment: Segment, type: string) => {
  moveType = type
  moveSegment = segment
  moveSegmentIndex = segmentList.findIndex(seg => seg.start === moveSegment.start && seg.end === moveSegment.end)
  document.addEventListener('mousemove', changeSegmentRange)
  document.addEventListener('mouseup', mouseup)
}
const mouseup = () => {
  document.removeEventListener('mousemove', changeSegmentRange)
  document.removeEventListener('mouseup', mouseup)
}
/**
 * 拖拽改变片段长度
 */
const changeSegmentRange = throttle((event: MouseEvent) => {
  let time = getTimeByMousePosition(event)

  if (moveType === 'start') {
    // 处理边界
    if (moveSegmentIndex !== 0) {
      if (time < segmentList[moveSegmentIndex - 1].end) {
        time = segmentList[moveSegmentIndex - 1].end
      }
    }
    moveSegment.setStart(time)
  } else if (moveType === 'end') {
    if (moveSegmentIndex !== segmentList.length - 1) {
      if (time > segmentList[moveSegmentIndex + 1].start) {
        time = segmentList[moveSegmentIndex + 1].start
      }
    }
    moveSegment.setEnd(time)
  }
  if (!isPlaying.value) {
    setCurrentTime(time, true)
  }
}, 150)

/**
 * 鼠标在时间线滑过，预览视频画面
 */
const preview = throttle((event: MouseEvent) => {
  if (isPlaying.value || isStopPreview) return
  const time = getTimeByMousePosition(event)
  setCurrentTime(time, true)
}, 150)
const onMouseleaveTimeLine = () => {
  if (isNaN(commandTime.value) || isPlaying.value) return
  setCurrentTime(commandTime.value)
  isStopPreview = true
  setTimeout(() => {
    isStopPreview = false
  }, 200);
}
</script>

<style lang="scss" scoped>
.segment {
  position: absolute;
  z-index: 10;
  height: 20px;
  top: 0;
  background-color: rgba(255, 255, 255, 0.3);
  transition: all 0.1s;

  // &:hover {
  //   height: 20px;
  //   background-color: rgba(0, 98, 255, 0.9);
  // }
  .handler {
    position: absolute;
    height: 100%;
    width: 4px;
    cursor: e-resize;

    &.start-handler {
      background-color: rgba(255, 255, 255, .56);
      left: 0;
    }

    &.end-handler {
      background-color: rgba(255, 255, 255, .4);
      right: 0;
    }
  }
}
</style>