export interface IIPC {
  ffmpeg: IFfmpeg
  os: IOS
}
declare global {
  interface Window {
    IPC: IIPC
  }
}