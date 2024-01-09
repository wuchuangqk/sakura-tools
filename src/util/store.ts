import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { Segment } from '@/util/Segment'

export const useStore = defineStore('app', () => {
  const videoMeta = reactive<IVideoMeta>({
    currentTime: 0,
    duration: 0,
    durationFmt: '00:00:00.000',
  })
  const filePath = ref()
  // const filePath = ref('D:\\Users\\qingkong\\Videos\\Captures\\枫丹.mp4')
  const isFileOpened = ref(false)
  const segmentList = reactive<Segment[]>([])
  const isPlaying = ref(false)
  const commandTime = ref(0)
  const thumbnails = reactive<Array<{ time: number, url: string, timeFmt: string }>>([])
  const keyFrames = ref<number[]>([])

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
    filePath,
    isFileOpened,
    segmentList,
    isPlaying,
    commandTime,
    action,
    thumbnails,
    keyFrames,
    reset,
  }
})