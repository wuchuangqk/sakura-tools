/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface IFfmpeg {
  run: (args: any[], cmd?: string, options?: any) => Promise<Buffer | string>,
}
interface IVideoMeta {
  currentTime: number
  duration: number
  durationFmt: string
}

interface ISegments {
  start: number
  end: number
}