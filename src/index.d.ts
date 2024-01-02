export interface IIPC {
  ffmpeg: IFfmpeg
}
declare global {
  interface Window {
    IPC: IIPC
  }
}