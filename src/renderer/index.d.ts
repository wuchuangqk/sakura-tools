import type { WebUtils } from 'electron'
export interface IIPC {
  ffmpeg: IFfmpeg
  os: IOS
  app: IApp
}
declare global {
  interface Window {
    IPC: IIPC,
    invoke: <T>(channel: string, ...args: any) => Promise<T>
    webUtils: WebUtils
  }
}