/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface IFfmpeg {
  run: (cmd: string, args: any[]) => Promise<Buffer | string>,
}
interface IVideo {
  milliseconds: string
  seconds: number
  minutes: number
  hours: number
  currentTime: number
  duration: number
}

interface ISegments {
  start: number
  end: number
}