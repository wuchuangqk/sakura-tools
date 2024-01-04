

<template>
  <FileLoader v-if="!isFileOpened" @load="onFileLoad" />
  <div v-if="isFileOpened" class="flex-1 overflow-hidden">
    <video ref="videoRef" :src="filePath"
      style="width: 100%;height: 100%;object-fit: contain;" @loadedmetadata="onLoadedmetadata"
      @timeupdate="timeupdate"></video>
  </div>
  <TimeLine v-if="isLoadVideoMeta" :thumbnails="thumbnailsSorted" :segment-list="segmentList" />
  <div v-if="isLoadVideoMeta" class="flex gap-10">
    <span>时长：{{ videoMeta.durationFmt }}</span>
    <span>当前：{{ currentTime }}</span>
  </div>
  <div v-if="isLoadVideoMeta" class="flex gap-1">
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="play">播放</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="pause">暂停</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="prevKeyFrame">上一个关键帧</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="nextKeyFrame">下一个关键帧</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="setKeyFrames">关键帧</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="addSegment">添加片段</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="setSegmentEnd">设置片段终点</button>
    <button class="py-1 px-2 bg-indigo-500 text-white border rounded" @click="exportVideo">导出</button>
  </div>
  <div v-for="(segment, index) in segmentList" :key="index" class="flex gap-10">
    <span>start{{ segment.start }}</span>
    <span>end{{ segment.end }}</span>
    <span>duration{{ fmtDuration(segment.end - segment.start) }}</span>
    <span>left{{ segment.left }}</span>
    <span>wdith{{ segment.width }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, provide } from 'vue'
import TimeLine from '@/components/TimeLine.vue'
import FileLoader from './components/FileLoader.vue'
import { fmtDuration, fmtSeconds } from '@/util'
import { renderThumbnails, queryKeyFrames, cutAndMergeVideo } from '@/util/ffmpeg'
import { sortBy } from 'lodash'
import { Segment } from '@/util/Segment'

const videoRef = ref<HTMLVideoElement>(null as unknown as HTMLVideoElement)
const videoMeta = reactive<IVideoMeta>({
  currentTime: 0,
  duration: 0,
  durationFmt: '00:00:00.000',
})
const filePath = ref()
const thumbnails = reactive<Array<{ time: number, url: string, timeFmt: string }>>([])
const isFileOpened = ref(false)
const isLoadVideoMeta = ref(false)
const keyFrames = ref<number[]>([])
const segmentList = reactive<Segment[]>([])
const isPlaying = ref(false)

const play = () => {
  videoRef.value.play()
  isPlaying.value = true
}
const pause = () => {
  videoRef.value.pause()
  isPlaying.value = false
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
      thumbnails.push({ ...payload, timeFmt: fmtDuration(payload.time) })
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

const addSegment = () => {
  const { currentTime } = videoMeta
  const existSegment = segmentList.find((seg) => seg.start <= currentTime && currentTime <= seg.end)
  // 如果当前时间点在某一个片段区间，则重设片段起点
  if (typeof existSegment !== 'undefined') {
    existSegment.setStart(currentTime)
  } else {
    // 否则，以当前时间点为开始，新添加一个片段
    let end = videoMeta.duration
    // 相邻片段的起点作为结束点
    const adjacent = segmentList.find(seg => currentTime < seg.start)
    if (typeof adjacent !== 'undefined') {
      end = adjacent.start
    }
    const newSegment = new Segment(videoMeta.duration, currentTime, end)
    segmentList.push(newSegment)
    segmentList.sort((a, b) => a.start - b.start)
    console.log(segmentList);

  }
}
const setSegmentEnd = () => {
  // 只有在区间时才可以设置终点
  const { currentTime } = videoMeta
  const segment = segmentList.find(seg => seg.start < currentTime && currentTime < seg.end)
  if (typeof segment !== 'undefined') {
    segment.setEnd(currentTime)
  } else {
    alert('设置终点只能在片段区间进行')
  }
}

const exportVideo = async () => {
  // if (!segmentList.length) return
  await cutAndMergeVideo(filePath.value, segmentList)
  alert('导出完成')
}

provide('APP', {
  videoMeta,
  isFileOpened,
  isPlaying,
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
