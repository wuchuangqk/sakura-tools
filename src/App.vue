

<template>
  <ConfigProvider :theme="theme">
    <FileLoader v-if="!isFileOpened" @load="onFileLoad" />
    <div v-if="isFileOpened" class="flex-1 overflow-hidden flex">
      <div class="flex-1">
        <video ref="videoRef" :src="filePath" style="width: 100%;height: 100%;object-fit: contain;"
        @loadedmetadata="onLoadedmetadata" @timeupdate="timeupdate"></video>
        <!-- <video ref="videoRef" src="D:\Users\qingkong\Videos\Captures\枫丹.mp4"
          style="width: 100%;height: 100%;object-fit: contain;" @loadedmetadata="onLoadedmetadata"
          @timeupdate="timeupdate"></video> -->
      </div>
      <SegmentList :segment-list="segmentList" @remove="removeSegment" />
    </div>
    <TimeLine v-if="isLoadVideoMeta" :thumbnails="thumbnailsSorted" :segment-list="segmentList" />
    <div v-if="isLoadVideoMeta" class="flex gap-10">
      <span>时长：{{ videoMeta.durationFmt }}</span>
    </div>
    <div v-if="isLoadVideoMeta" class="flex gap-2">
      <Button v-if="!isPlaying" type="primary" @click="play">[space]播放</Button>
      <Button v-if="isPlaying" type="primary" @click="pause">[space]暂停</Button>
      <Button type="primary" @click="prevKeyFrame">[A]上一个关键帧</Button>
      <Button type="primary" @click="nextKeyFrame">[D]下一个关键帧</Button>
      <Button type="primary" @click="addSegment">[Q]添加片段</Button>
      <Button type="primary" @click="setSegmentEnd">[E]设置片段终点</Button>
      <Button type="primary" @click="exportVideo">导出</Button>
      <TimeInput :value="videoMeta.currentTime" @change="changeVideoCurrentTime" />
    </div>
    <div v-if="isLoading" class=" fixed top-0 right-0 bottom-0 left-0 z-10 flex items-center justify-center bg-black/50">
      <Spin tip="正在导出" size="large" />
    </div>
  </ConfigProvider>
</template>
<script setup lang="ts">
import { computed, reactive, ref, provide } from 'vue'
import TimeLine from '@/components/TimeLine.vue'
import FileLoader from './components/FileLoader.vue'
import { fmtDuration, fmtSeconds } from '@/util'
import { renderThumbnails, queryKeyFrames, cutAndMergeVideo } from '@/util/ffmpeg'
import { sortBy } from 'lodash'
import { Segment } from '@/util/Segment'
import { bindKeyboard } from '@/util/keyboard'
import TimeInput from './components/TimeInput.vue'
import SegmentList from './components/SegmentList.vue'
import { useStore } from '@/util/store'
import { Button, ConfigProvider, message, Spin } from 'ant-design-vue';

const store = useStore()
const videoRef = ref<HTMLVideoElement>(null as unknown as HTMLVideoElement)
const videoMeta = reactive<IVideoMeta>({
  currentTime: 0,
  duration: 0,
  durationFmt: '00:00:00.000',
})
const filePath = ref()
// const filePath = ref('D:\\Users\\qingkong\\Videos\\Captures\\枫丹.mp4')
// store.filePath = filePath.value
const thumbnails = reactive<Array<{ time: number, url: string, timeFmt: string }>>([])
const isFileOpened = ref(false)
// const isFileOpened = ref(true)
const isLoadVideoMeta = ref(false)
const keyFrames = ref<number[]>([])
const segmentList = reactive<Segment[]>([])
const isPlaying = ref(false)
const commandTime = ref(0)
const theme = {
  token: {
    borderRadius: 2,
  }
}
const isLoading = ref(false)

const play = () => {
  videoRef.value.play()
  isPlaying.value = true
}
const pause = () => {
  videoRef.value.pause()
  isPlaying.value = false
  commandTime.value = videoRef.value.currentTime
}
const togglePlay = () => {
  if (!isLoadVideoMeta.value) return
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}
const onLoadedmetadata = () => {
  const { duration } = videoRef.value
  Object.assign(videoMeta, fmtSeconds(duration))
  videoMeta.duration = duration
  videoMeta.durationFmt = fmtDuration(duration)
  store.videoMeta = videoMeta
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
  store.filePath = filePath.value
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
const removeSegment = (index: number) => {
  segmentList.splice(index, 1)
}

const exportVideo = async () => {
  if (!segmentList.length) return
  isLoading.value = true
  await cutAndMergeVideo(filePath.value, segmentList)
  isLoading.value = false
  message.success('导出完成')
}

// 键位映射
const keyboardActions: IKeyboardActions = {
  'togglePlay': () => togglePlay(),
  'prevKeyFrame': () => prevKeyFrame(),
  'nextKeyFrame': () => nextKeyFrame(),
  'setSegmentStart': () => addSegment(),
  'setSegmentEnd': () => setSegmentEnd(),
}
bindKeyboard(keyboardActions)

const changeVideoCurrentTime = (time: number) => {
  setCurrentTime(time)
  commandTime.value = time
}

provide('APP', {
  videoMeta,
  isFileOpened,
  isPlaying,
  commandTime,
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
