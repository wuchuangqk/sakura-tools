<template>
  <div ref="timeLineRef" style="height: 50px;" class="relative" @click="click">
    <div class="flex h-full">
      <div v-for="thumbnail in thumbnails" :key="thumbnail.url" class="flex-1 pr-1 last-of-type:pr-0">
        <img :src="thumbnail.url" alt="" style="max-width: 100%;" class="h-full object-cover">
      </div>
    </div>
    <TimeLinePointer :left="playProgress" />
  </div>
</template>
<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import TimeLinePointer from './TimeLinePointer.vue';

withDefaults(defineProps<{
  thumbnails: any[],
}>(), {
  thumbnails: () => []
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

<style lang="scss" scoped></style>