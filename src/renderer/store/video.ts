import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { Segment } from '@/renderer/util/Segment'

const { invoke } = window

export const useVideoStore = defineStore('video', () => {
  const videoMeta = reactive<IVideoMeta>({
    currentTime: 0, // 视频当前时间点（单位：秒）
    duration: 0, // 视频时长（单位：秒）
    durationFmt: '00:00:00.000',
  })
  const projectMeta = reactive({
    fileName: '',
    outDir: '', // 导出视频所在目录
    filePath: '',
  })
  const show = reactive({
    exportComplete: false,
  })
  const isFileOpened = ref(false) // 是否打开文件
  const segmentList = reactive<Segment[]>([]) // 片段列表
  const isPlaying = ref(false) // 视频是否在播放
  const commandTime = ref(0)
  const thumbnails = reactive<IThumbnail[]>([]) // 视频缩略图
  const keyFrames = ref<number[]>([]) // 关键帧时间点集合
  const appMeta = reactive({
    name: '',
    version: ''
  })

  // @ts-ignore
  const action: IStoreAction = {}

  const reset = () => {
    segmentList.length = 0
    isPlaying.value = false
    commandTime.value = 0
    videoMeta.currentTime = 0
    videoMeta.duration = 0
    videoMeta.durationFmt = '00:00:00.000'
    thumbnails.length = 0
    keyFrames.value.length = 0
    show.exportComplete = false
  }
  const init = async () => {
    appMeta.name = await invoke<string>('app:getName')
    appMeta.version = await invoke<string>('app:getVersion')
  }

  return {
    videoMeta,
    isFileOpened,
    segmentList,
    isPlaying,
    commandTime,
    action,
    thumbnails,
    keyFrames,
    projectMeta,
    appMeta,
    show,
    reset,
    init,
  }
})