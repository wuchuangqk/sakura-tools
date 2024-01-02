

<template>
  <FileLoader v-if="!isFileOpened" @load="onFileLoad" />
  <div v-if="isFileOpened">
    <video ref="videoRef" :src="filePath" style="width: 100%;height: 100%;object-fit: contain;" @canplay="canplay"
      @timeupdate="timeupdate"></video>
  </div>
  <TimeLine :thumbnails="thumbnailsSorted" />
  <div v-if="isFileOpened">
    <span>时长：{{ fmtDuration(videoMeta) }}</span>
    <span>当前：{{ currentTime }}</span>
  </div>
  <div v-if="isFileOpened" class="flex gap-1">
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="play">播放</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="pause">暂停</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="showThumbnail">缩略图</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="prevKeyFrame">上一个关键帧</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="nextKeyFrame">下一个关键帧</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="showKeyFrames">关键帧</button>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import TimeLine from '@/components/TimeLine.vue'
import FileLoader from './components/FileLoader.vue'
import { fmtDuration, isNotEmpty, fmtSeconds, isEmpty } from '@/util'
import { renderThumbnails, getKeyFrames } from '@/util/ffmpeg'
import { sortBy } from 'lodash'

const videoRef = ref<HTMLVideoElement>(null as unknown as HTMLVideoElement)
const videoMeta = reactive({
  milliseconds: '0.000',
  seconds: 0,
  minutes: 0,
  hours: 0,
  currentTime: 0,
  duration: 0,
})
const filePath = ref()
const thumbnails = reactive<Array<{ time: number, url: string }>>([])
const isFileOpened = ref(false)
const neighbouringKeyFrames = reactive([])

const play = () => {
  videoRef.value.play()
}
const pause = () => {
  videoRef.value.pause()
}
const canplay = () => {
  const { duration } = videoRef.value
  Object.assign(videoMeta, fmtSeconds(duration))
  videoMeta.duration = duration
  console.log(`时长${videoMeta.duration}秒 ${fmtDuration(duration)}`);

}
// 实时获取视频播放进度
const timeupdate = () => {
  const { currentTime } = videoRef.value
  videoMeta.currentTime = currentTime
}

const setCurrentTime = (currentTime: number) => {
  if (isEmpty(videoMeta)) return
  videoMeta.currentTime = currentTime
}

const showThumbnail = () => {
  thumbnails.length = 0
  renderThumbnails({
    filePath: filePath.value,
    from: 0,
    duration: videoMeta.duration,
    onThumbnail: (payload: { time: number, url: string }) => {
      thumbnails.push(payload)
    }
  }).catch(err => {
    console.error('Failed to render thumbnail', err);
  })
}

const currentTime = computed(() => fmtDuration(videoMeta.currentTime))

const thumbnailsSorted = computed(() => sortBy(thumbnails, (thumbnail: { time: number }) => thumbnail.time))

const prevKeyFrame = () => {

}
const nextKeyFrame = () => {

}
const showKeyFrames = async () => {
  const keyFrames = await getKeyFrames({
    filePath: filePath.value,
    from: 0,
    duration: 50,
  })
  console.log(keyFrames);
  
}

const onFileLoad = (files: FileList) => {
  if (files.length === 0) return
  // @ts-ignore
  filePath.value = files[0].path
  console.log(filePath.value);

  isFileOpened.value = true
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
