export interface IIPC {
  ffmpeg: IFfmpeg
  os: IOS
  app: IApp
}
declare global {
  interface Window {
    IPC: IIPC
  }
}