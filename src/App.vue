

<template>
  <div>
    <div>
      <video ref="videoRef" src="D:\Users\qingkong\Videos\Captures\渊下宫3.mp4"
        style="width: 100%;height: 100%;object-fit: contain;" @canplay="canplay" @timeupdate="timeupdate"></video>
    </div>
    <Timeline :thumbnails="thumbnailsSorted" />
    <div v-if="isNotEmpty(video)">
      <span>时长：{{ fmtDuration(video) }}</span>
      <span>当前：{{ currentTime }}</span>
    </div>
    <div class="flex gap-1">
      <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="play">播放</button>
      <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="pause">暂停</button>
      <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="showThumbnail">缩略图</button>
      <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="prevKeyFrame">上一个关键帧</button>
      <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="nextKeyFrame">下一个关键帧</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Timeline from '@/components/TimeLine.vue'
import { fmtDuration, isNotEmpty, fmtSeconds, isEmpty } from '@/util'
import { renderThumbnails } from '@/util/ffmpeg'
import { sortBy } from 'lodash'

const videoRef = ref<HTMLVideoElement>(null as unknown as HTMLVideoElement)
const video = ref<IVideo>({} as IVideo)
const filePath = 'D:\\Users\\qingkong\\Videos\\Captures\\渊下宫3.mp4'
const thumbnails = reactive<Array<{ time: number, url: string }>>([])

const play = () => {
  videoRef.value.play()
}
const pause = () => {
  videoRef.value.pause()
}
const canplay = () => {
  const { duration } = videoRef.value
  video.value = Object.assign(video.value, fmtSeconds(duration))
  video.value.duration = duration
  console.log('video canplay:', video.value);

}
const timeupdate = () => {
  // const { currentTime } = videoRef.value
  // video.value.currentTime = currentTime
}

const setCurrentTime = (currentTime: number) => {
  if (isEmpty(video.value)) return
  video.value.currentTime = currentTime
}

const showThumbnail = () => {
  renderThumbnails({
    filePath,
    from: 0,
    duration: video.value.duration,
    onThumbnail: (payload: { time: number, url: string }) => {
      thumbnails.push(payload)
    }
  }).catch(err => {
    console.error('Failed to render thumbnail', err);
  })
}

const currentTime = computed(() => fmtDuration(fmtSeconds(video.value.currentTime)))

const thumbnailsSorted = computed(() => sortBy(thumbnails, (thumbnail: { time: number }) => thumbnail.time))

const prevKeyFrame = () => {
  
}

const nextKeyFrame = () => {

}
</script>
<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
