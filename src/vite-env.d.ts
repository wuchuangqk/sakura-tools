/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface IVideoMeta {
  currentTime: number
  duration: number
  durationFmt: string
}

interface IProjectMeta {
  fileName: string
  outDir: string
  filePath: string
}

interface IKeyboardActions {
  [key: string]: Function
}
interface IKeyBindings {
  [key: string]: string
}

interface IStoreAction {
  setCurrentTime: (currentTime: number, preivew?: boolean) => void
  // exportVideo: () => Promise<void>
}

interface IThumbnail {
  time: number,
  url: string,
  timeFmt: string
}

interface IImg {
  path: string,
  compressedImg: string,
  originSize: number,
  compressedSize: number,
  loading: boolean,
}