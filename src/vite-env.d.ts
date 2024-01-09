/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface IFfmpeg {
  run: (args: any[], cmd?: string, options?: any) => Promise<Buffer | string>,
}
interface IOS {
  getFileMeta: (filePath: string) => Promise<{ name: string, dir: string }>,
  createTxt: (outPathList: string[], dir: string) => Promise<void>,
  removeFile: (pathList: string[]) => Promise<void>,
}
interface IVideoMeta {
  currentTime: number
  duration: number
  durationFmt: string
}

interface IKeyboardActions {
  [key: string]: Function
}
interface IKeyBindings {
  [key: string]: string
}

interface IStoreAction {
  setCurrentTime: (currentTime: number) => void
  // exportVideo: () => Promise<void>
}