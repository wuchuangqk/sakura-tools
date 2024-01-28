<template>
  <div class="h-full overflow-hidden flex flex-col">
    <StartPage v-if="!isFileOpened" @load="onFileLoad" />
    <div v-if="isFileOpened" class="flex-1 overflow-hidden flex">
      <div class="flex-1 flex flex-col">
        <div class="flex-1 overflow-hidden">
          <video ref="videoRef" :src="projectMeta.filePath" class="w-full h-full object-contain"
            @loadedmetadata="onLoadedmetadata" @timeupdate="timeupdate"></video>
          <!-- <video ref="videoRef" src="D:\Users\qingkong\Videos\Captures\枫丹.mp4" class="w-full h-full object-contain"
            @loadedmetadata="onLoadedmetadata" @timeupdate="timeupdate"></video> -->
        </div>
        <div v-if="isLoadVideoMeta" class="flex h-[40px] items-center px-10">
          <div class="flex items-center">
            <TimeInput ref="videoTimeRef" :value="videoMeta.currentTime" @change="changeVideoCurrentTime" />
            <span class=" text-gray-400 fs-13 ml-10">{{ videoMeta.durationFmt }}</span>
          </div>
          <div class="flex-1 gap-16 flex justify-center">
            <Tooltip>
              <template #title>
                <div class="fs-13">设置片段起点</div>
                <div class="fs-13 text-gray-400">快捷键：Q</div>
              </template>
              <Icon name="cutStart" size="20" @click="addSegment" />
            </Tooltip>
            <Tooltip>
              <template #title>
                <div class="fs-13">上一个关键帧</div>
                <div class="fs-13 text-gray-400">快捷键：A</div>
              </template>
              <Icon name="prevKeyFrame" size="20" @click="prevKeyFrame" />
            </Tooltip>
            <Tooltip>
              <template #title>
                <div class="fs-13">{{ isPlaying ? '暂停' : '播放' }}</div>
                <div class="fs-13 text-gray-400">快捷键：空格</div>
              </template>
              <Icon v-if="!isPlaying" name="play" size="20" @click="play" />
              <Icon v-else name="pause" size="20" @click="pause" />
            </Tooltip>
            <Tooltip>
              <template #title>
                <div class="fs-13">下一个关键帧</div>
                <div class="fs-13 text-gray-400">快捷键：D</div>
              </template>
              <Icon name="nextKeyFrame" size="20" @click="nextKeyFrame" />
            </Tooltip>
            <Tooltip>
              <template #title>
                <div class="fs-13">设置片段终点</div>
                <div class="fs-13 text-gray-400">快捷键：E</div>
              </template>
              <Icon name="cutEnd" size="20" @click="setSegmentEnd" />
            </Tooltip>
          </div>
          <div></div>
        </div>
      </div>
      <SegmentList @remove="removeSegment" />
    </div>
    <TimeLine v-if="isLoadVideoMeta" />
    <div v-if="isLoadVideoMeta" class=" text-gray-400 fs-13 h-30 flex items-center justify-between px-10">
      <div class="flex items-center">
        <Icon name="video" size="16" color="#9ca3af" />
        <span>{{ projectMeta.filePath }}</span>
      </div>
      <div class="flex gap-10">
        <span>{{ appMeta.name }}</span>
        <span>{{ appMeta.version }}</span>
      </div>
    </div>
    <Modal v-model:open="modal.replaceProject" title="提示" centered @ok="resolve">
      <div>替换当前文件吗？</div>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import TimeLine from './components/TimeLine.vue'
import StartPage from './components/StartPage.vue'
import TimeInput from './components/TimeInput.vue'
import SegmentList from './components/SegmentList.vue'
import { emitter, fmtDuration, fmtSeconds, renderThumbnails, queryKeyFrames, Segment, bindKeyboard, C } from '@/util'
import { useVideoStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useModule, usePromise } from '@/composables'
import { message } from 'ant-design-vue';

const { invoke } = window

const store = useVideoStore()
store.init()
const { isFileOpened, isPlaying, commandTime, keyFrames } = storeToRefs(store)
const videoMeta = store.videoMeta
const segmentList = store.segmentList
const thumbnails = store.thumbnails
const projectMeta = store.projectMeta
const appMeta = store.appMeta

const videoRef = ref<HTMLVideoElement>(null as unknown as HTMLVideoElement)
const isLoadVideoMeta = ref(false)
const videoTimeRef = ref()

const { isModuleActive } = useModule(C.VIDEO_MODULE)
const { resolve, future } = usePromise()

const modal = reactive({
  replaceProject: false,
})

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

const setCurrentTime = (currentTime: number, preview: boolean = false) => {
  videoMeta.currentTime = currentTime
  videoRef.value.currentTime = currentTime
  if (!preview) {
    commandTime.value = currentTime
  }
}

const showThumbnail = () => {
  thumbnails.length = 0
  renderThumbnails({
    from: 0,
    duration: videoMeta.duration,
    onThumbnail: (payload: { time: number, url: string }) => {
      thumbnails.push({ ...payload, timeFmt: fmtDuration(payload.time) })
    }
  }).catch(err => {
    console.error('Failed to render thumbnail', err);
  })
}

const prevKeyFrame = () => {
  const { currentTime } = videoMeta
  const frameTime = keyFrames.value.find((time: number, i) => {
    // 当前元素是最后一位
    if (i === keyFrames.value.length - 1) {
      return Math.floor(time) < currentTime
    } else {
      return Math.floor(time) < currentTime && keyFrames.value[i + 1] >= currentTime
    }
  })
  if (typeof frameTime !== 'undefined') setCurrentTime(frameTime)
}
const nextKeyFrame = () => {
  const { currentTime } = videoMeta
  // 修复点击下一帧没反应的问题，将time转成整数，使得至少比currentTime多一秒的时间，不然两个时间太接近，设置currentTime没效果
  // frameTime:128.128 currentTime:128.127998
  const frameTime = keyFrames.value.find((time: number) => Math.floor(time) > currentTime)
  if (typeof frameTime !== 'undefined') setCurrentTime(frameTime)
}
const setKeyFrames = async () => {
  const newKeyFrames = await queryKeyFrames({
    duration: videoMeta.duration,
  })
  // 去重加排序
  keyFrames.value = Array.from(new Set([...keyFrames.value, ...newKeyFrames]))
  keyFrames.value.sort((a, b) => a - b)
}

const onFileLoad = async (files: FileList) => {
  if (files.length === 0) return
  // @ts-ignore
  projectMeta.filePath = files[0].path
  console.log(projectMeta.filePath);
  isFileOpened.value = true
  const { name, dir } = await invoke<IFileMeta>('os:getFileMeta', projectMeta.filePath)
  projectMeta.fileName = name
  projectMeta.outDir = dir
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
    const newSegment = new Segment(currentTime, end)
    segmentList.push(newSegment)
    segmentList.sort((a, b) => a.start - b.start)
    // newSegment是非响应式对象，存到segmentList里面的才会被变成响应式对象
    const reactiveSeg = segmentList.find(seg => seg.key === newSegment.key)
    reactiveSeg!.createThumbnail()
  }
}
const setSegmentEnd = () => {
  // 只有在区间时才可以设置终点
  const { currentTime } = videoMeta
  const segment = segmentList.find(seg => seg.start < currentTime && currentTime < seg.end)
  if (typeof segment !== 'undefined') {
    segment.setEnd(currentTime)
  } else {
    message.error('设置终点只能在片段区间进行')
  }
}
const removeSegment = (index: number) => {
  segmentList.splice(index, 1)
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
  if (time < 0 || time > videoMeta.duration) {
    videoTimeRef.value.reset()
    return
  }
  setCurrentTime(time)
  commandTime.value = time
}

const drop = async (files: FileList) => {
  // console.log('isModuleActive', isModuleActive.value, C.VIDEO_MODULE);
  if (!isModuleActive.value) return
  // 检查mimetype，例如 video/mp4 video/mkv
  console.log(files[0].type);
  if (!files[0].type.startsWith('video')) return message.error('暂不支持该视频格式')
  if (!isFileOpened.value) {
    onFileLoad(files)
    return
  }
  // 询问是否要替换当前视频
  await future(() => modal.replaceProject = true)
  modal.replaceProject = false
  store.reset()
  onFileLoad(files)
}

store.action.setCurrentTime = setCurrentTime

onMounted(() => {
  emitter.on(C.USER_DROP_FILE, drop as any)
})
onUnmounted(() => {
  emitter.off(C.USER_DROP_FILE, drop as any)
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
