import Decimal from "decimal.js"
import { renderThumbnail } from './ffmpeg'
import { debounce } from 'lodash'
import { useStore } from '@/util/store'
import { nextTick } from 'vue'

export class Segment {
  start: number
  end: number
  left: string = '0'
  width: string = '0'
  videoDuration: number // 根据视频长度计算片段长度
  thumbnail: string = '' // 片段封面
  updateThumbnail: Function
  store
  key: symbol

  constructor(videoDuration: number, start: number = 0, end: number = 0) {
    this.videoDuration = videoDuration
    this.start = start
    this.end = end
    this.left = Decimal.div(this.start, this.videoDuration).mul(100) + '%'
    this.width = Decimal.sub(this.end, this.start).div(this.videoDuration).mul(100) + '%'
    this.thumbnail = ''
    this.key = Symbol()
    this.store = useStore()
    this.createThumbnail()
    this.updateThumbnail = debounce(this.createThumbnail, 2500)
  }

  setStart(start: number) {
    const _start = this.start
    this.start = start
    this.left = Decimal.div(this.start, this.videoDuration).mul(100) + '%'
    // 时间点发生变动，更新片段长度
    if (this.start !== _start) {
      this.width = Decimal.sub(this.end, this.start).div(this.videoDuration).mul(100) + '%'
      this.updateThumbnail()
    }
  }

  setEnd(end: number) {
    const _end = this.end
    this.end = end
    // 时间点发生变动，更新片段长度
    if (this.end !== _end) {
      this.width = Decimal.sub(this.end, this.start).div(this.videoDuration).mul(100) + '%'
    }
  }

  async createThumbnail() {
    const url = await renderThumbnail(this.store.filePath, this.start)
    this.thumbnail = url
  }

}