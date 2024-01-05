import { defineStore } from "pinia";
export const useStore = defineStore('app', () => {
  let videoMeta = null as unknown as IVideoMeta
  let filePath = ''

  return {
    videoMeta,
    filePath,
  }
})