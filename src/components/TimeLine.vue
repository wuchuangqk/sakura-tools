<template>
  <div ref="timeLineRef" class="relative flex flex-col bg-[#313131] pt-20 pb-20" @click="click">
    <div class="flex mb-10">
      <span v-for="thumbnail in thumbnails" :key="thumbnail.time" class="flex-1 overflow-hidden text-xs text-gray-500">
        {{ thumbnail.timeFmt }}
      </span>
    </div>
    <div class="flex relative" style="height: 60px;">
      <div v-for="thumbnail in thumbnails" :key="thumbnail.url"
        class="flex-1 overflow-hidden pr-1 last-of-type:pr-0 h-full">
        <img :src="thumbnail.url" alt="" class=" w-full h-full object-cover">
      </div>

    </div>
    <div class=" absolute left-0 right-0 bottom-0 h-20">
      <div v-for="segment in segmentList" :key="segment.start" class="segment"
        :style="{ left: segment.left, width: segment.width }"></div>
    </div>
    <TimeLinePointer :left="playProgress" />
  </div>
</template>
<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import TimeLinePointer from './TimeLinePointer.vue';

withDefaults(defineProps<{
  thumbnails: any[],
  segmentList: ISegments[],
}>(), {
  thumbnails: () => [],
  segmentList: () => [],
})

const { videoMeta, setCurrentTime } = inject('APP') as {
  videoMeta: IVideoMeta,
  setCurrentTime: (currentTime: number) => void,
}

const timeLineRef = ref<HTMLElement>(null as unknown as HTMLElement)

// 播放进度
const playProgress = computed(() => {
  const { currentTime, duration } = videoMeta
  const progress = (currentTime / duration * 100).toFixed(2) + '%'
  return progress
})

// 手动设置播放进度
const click = (event: MouseEvent) => {
  const rect = timeLineRef.value.getBoundingClientRect()
  const relX = event.pageX - (rect.left + document.body.scrollLeft)
  // relX / timeLineRef.value.offsetWidth 是一个百分比，用播放时间乘以百分比，来求出时间点（单位：秒）
  const currentTime = videoMeta.duration * (relX / timeLineRef.value.offsetWidth)
  setCurrentTime(currentTime)
}
</script>

<style lang="scss" scoped>
.segment {
  position: absolute;
  height: 10px;
  top: -5px;
  background-color: rgba(0, 98, 255, 0.7);
  transition: all 0.1s;
  &:hover {
    height: 20px;
    background-color: rgba(0, 98, 255, 0.9);
  }
}
</style>