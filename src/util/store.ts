import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { Segment } from '@/util/Segment'

export const useStore = defineStore('app', () => {
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
  const isFileOpened = ref(false) // 是否打开文件
  const segmentList = reactive<Segment[]>([]) // 片段列表
  const isPlaying = ref(false) // 视频是否在播放
  const commandTime = ref(0)
  const thumbnails = reactive<Array<{ time: number, url: string, timeFmt: string }>>([]) // 视频缩略图
  const keyFrames = ref<number[]>([]) // 关键帧时间点集合

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
    reset,
  }
})