<template>
  <div ref="timeLineRef" class="relative flex flex-col bg-[#313131] pt-20 pb-20 select-none" @click="click"
    @mousemove="preview" @mouseleave="onMouseleaveTimeLine">
    <div class="flex mb-10">
      <span v-for="thumbnail in thumbnails" :key="thumbnail.time" class="flex-1 overflow-hidden text-xs text-gray-500">
        {{ thumbnail.timeFmt }}
      </span>
    </div>
    <div class="flex relative" style="height: 60px;">
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
    <TimeLinePointer :left="previewPointer" type="preview" />
  </div>
</template>
<script setup lang="ts">
import { computed, inject, ref, Ref } from 'vue'
import TimeLinePointer from './TimeLinePointer.vue';
import { Segment } from '@/util/Segment'
import { throttle } from 'lodash'
import Decimal from 'decimal.js';

const props = withDefaults(defineProps<{
  thumbnails: any[],
  segmentList: Segment[],
}>(), {
  thumbnails: () => [],
  segmentList: () => [],
})

const { videoMeta, setCurrentTime, isPlaying } = inject('APP') as {
  videoMeta: IVideoMeta,
  setCurrentTime: (currentTime: number) => void,
  isPlaying: Ref<boolean>,
}

const timeLineRef = ref<HTMLElement>(null as unknown as HTMLElement)
let moveSegment: Segment
let moveSegmentIndex: number
let moveType: string
let isStopPreview = false
let commandTime: number = 0

// 播放进度
const playProgress = computed(() => {
  const { currentTime, duration } = videoMeta
  const time = isPlaying.value ? currentTime : commandTime
  const progress = Decimal.div(time, duration).mul(100).toFixed(2) + '%'
  return progress
})

const previewPointer = computed(() => {
  const { currentTime, duration } = videoMeta
  const progress = Decimal.div(currentTime, duration).mul(100).toFixed(2) + '%'
  return progress
})

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
  commandTime = time
  setCurrentTime(time)
}

const mousedown = (segment: Segment, type: string) => {
  moveType = type
  moveSegment = segment
  moveSegmentIndex = props.segmentList.findIndex(seg => seg.start === moveSegment.start && seg.end === moveSegment.end)
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', mouseup)
}
const mouseup = () => {
  document.removeEventListener('mousemove', move)
  document.removeEventListener('mouseup', mouseup)
}
const move = throttle((event: MouseEvent) => {
  let time = getTimeByMousePosition(event)

  if (moveType === 'start') {
    // 处理边界
    if (moveSegmentIndex !== 0) {
      if (time < props.segmentList[moveSegmentIndex - 1].end) {
        time = props.segmentList[moveSegmentIndex - 1].end
      }
    }
    moveSegment.setStart(time)
  } else if (moveType === 'end') {
    if (moveSegmentIndex !== props.segmentList.length - 1) {
      if (time > props.segmentList[moveSegmentIndex + 1].start) {
        time = props.segmentList[moveSegmentIndex + 1].start
      }
    }
    moveSegment.setEnd(time)
  }
  if (!isPlaying.value) {
    setCurrentTime(time)
  }
}, 150)

const preview = throttle((event: MouseEvent) => {
  if (isPlaying.value || isStopPreview) return
  const time = getTimeByMousePosition(event)
  setCurrentTime(time)
}, 150)
const onMouseleaveTimeLine = () => {
  if (isNaN(commandTime)) return
  setCurrentTime(commandTime)
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
  background-color: rgba(255, 255, 255, 0.714);
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
      background-color: rgb(0, 213, 14);
      left: 0;
    }

    &.end-handler {
      background-color: rgb(255, 42, 0);
      right: 0;
    }
  }
}
</style>