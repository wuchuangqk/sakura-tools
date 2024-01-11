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
  createTxtFile: (outPathList: string[], dir: string) => Promise<void>,
  removeFile: (pathList: string[]) => Promise<void>,
  openDir: (dirPath: string) => Promise<void>,
}
interface IApp {
  getVersion: () => Promise<string>,
  getName: () => Promise<string>,
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