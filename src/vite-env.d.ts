/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface IFfmpeg {
  runFfmpeg: (args: any[]) => Promise<Buffer>,
}
export interface IIPC {
  ffmpeg: IFfmpeg
}
declare global {
  interface Window {
    IPC: IIPC
  }
}

interface IVideo {
  milliseconds: string
  seconds: number
  minutes: number
  hours: number
  currentTime: number
  duration: number
}