

<template>
  <FileLoader v-if="!isFileOpened" @load="onFileLoad" />
  <div v-if="isFileOpened">
    <video ref="videoRef" :src="filePath" style="width: 100%;height: 100%;object-fit: contain;"
      @loadedmetadata="onLoadedmetadata" @timeupdate="timeupdate"></video>
  </div>
  <TimeLine v-if="isLoadVideoMeta" :thumbnails="thumbnailsSorted" />
  <div v-if="isLoadVideoMeta" class="flex gap-10">
    <span>时长：{{ videoMeta.durationFmt }}</span>
    <span>当前：{{ currentTime }}</span>
  </div>
  <div v-if="isLoadVideoMeta" class="flex gap-1">
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="play">播放</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="pause">暂停</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="showThumbnail">缩略图</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="prevKeyFrame">上一个关键帧</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="nextKeyFrame">下一个关键帧</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="setKeyFrames">关键帧</button>
  </div>
  <div v-if="isLoadVideoMeta" class="flex gap-1">
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="setCutStart">设置开始时间</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="setCutEnd">设置结束时间</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="exportVideo">导出</button>
  </div>
  <div v-for="(segment, index) in segmentList" :key="index" class="flex gap-10">
    <span>剪切开始时间：{{ segment.start }}</span>
    <span>剪切结束时间：{{ segment.end }}</span>
    <span>时长：{{ fmtDuration(segment.end - segment.start) }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, provide } from 'vue'
import TimeLine from '@/components/TimeLine.vue'
import FileLoader from './components/FileLoader.vue'
import { fmtDuration, fmtSeconds } from '@/util'
import { renderThumbnails, queryKeyFrames, cutVideo } from '@/util/ffmpeg'
import { sortBy } from 'lodash'

const videoRef = ref<HTMLVideoElement>(null as unknown as HTMLVideoElement)
const videoMeta = reactive<IVideoMeta>({
  currentTime: 0,
  duration: 0,
  durationFmt: '00:00:00.000',
})
const filePath = ref()
const thumbnails = reactive<Array<{ time: number, url: string }>>([])
const isFileOpened = ref(false)
const isLoadVideoMeta = ref(false)
const keyFrames = ref<number[]>([])
const segmentList = reactive<ISegments[]>([])

const play = () => {
  videoRef.value.play()
}
const pause = () => {
  videoRef.value.pause()
}
const onLoadedmetadata = () => {
  const { duration } = videoRef.value
  Object.assign(videoMeta, fmtSeconds(duration))
  videoMeta.duration = duration
  videoMeta.durationFmt = fmtDuration(duration)
  console.log(`时长${videoMeta.duration}秒 ${videoMeta.durationFmt}`);
  isLoadVideoMeta.value = true
  showThumbnail()
  setKeyFrames()
}
// 实时获取视频播放进度
const timeupdate = () => {
  const { currentTime } = videoRef.value
  videoMeta.currentTime = currentTime
}

const setCurrentTime = (currentTime: number) => {
  videoMeta.currentTime = currentTime
  videoRef.value.currentTime = currentTime
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
  const { currentTime } = videoMeta
  const frameTime = keyFrames.value.find((time: number, i) => {
    // 当前元素是最后一位
    if (i === keyFrames.value.length - 1) {
      return time < currentTime
    } else {
      return time < currentTime && keyFrames.value[i + 1] >= currentTime
    }
  })
  if (typeof frameTime !== 'undefined') setCurrentTime(frameTime)
}
const nextKeyFrame = () => {
  const { currentTime } = videoMeta
  const frameTime = keyFrames.value.find((time: number) => time > currentTime)
  if (typeof frameTime !== 'undefined') setCurrentTime(frameTime)
}
const setKeyFrames = async () => {
  const newKeyFrames = await queryKeyFrames({
    filePath: filePath.value,
    duration: videoMeta.duration,
  })
  // 去重加排序
  keyFrames.value = Array.from(new Set([...keyFrames.value, ...newKeyFrames]))
  keyFrames.value.sort((a, b) => a - b)
}

const onFileLoad = (files: FileList) => {
  if (files.length === 0) return
  // @ts-ignore
  filePath.value = files[0].path
  console.log(filePath.value);
  isFileOpened.value = true
}

const setCutStart = () => {
  segmentList.push({ start: videoMeta.currentTime, end: videoMeta.duration })
}
const setCutEnd = () => {
  if (!segmentList.length) return
  segmentList[segmentList.length - 1].end = videoMeta.currentTime
}
const exportVideo = async () => {
  if (!segmentList.length) return
  const { start, end } = segmentList[0]
  await cutVideo({
    filePath: filePath.value,
    from: start,
    duration: end - start
  })
  alert('导出完成')
}

provide('APP', {
  videoMeta,
  isFileOpened,
  setCurrentTime,
})
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
