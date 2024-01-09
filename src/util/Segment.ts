import Decimal from "decimal.js"
import { renderThumbnail } from './ffmpeg'
import { debounce } from 'lodash'
import { useStore } from '@/util/store'

let duration = 0
let filePath = ''
export class Segment {
  start: number
  end: number
  left: string = '0'
  width: string = '0'
  thumbnail: string = '' // 片段封面
  updateThumbnail: Function
  key = Symbol()

  constructor(start: number = 0, end: number = 0) {
    const store = useStore()
    duration = store.videoMeta.duration
    filePath = store.filePath
    this.start = start
    this.end = end
    this.left = Decimal.div(this.start, duration).mul(100) + '%'
    this.width = Decimal.sub(this.end, this.start).div(duration).mul(100) + '%'
    this.thumbnail = ''
    this.key = Symbol()
    this.updateThumbnail = debounce(this.createThumbnail, 600)
  }

  setStart(start: number) {
    const _start = this.start
    this.start = start
    this.left = Decimal.div(this.start, duration).mul(100) + '%'
    // 时间点发生变动，更新片段长度
    if (this.start !== _start) {
      this.width = Decimal.sub(this.end, this.start).div(duration).mul(100) + '%'
      this.updateThumbnail()
    }
  }

  setEnd(end: number) {
    const _end = this.end
    this.end = end
    // 时间点发生变动，更新片段长度
    if (this.end !== _end) {
      this.width = Decimal.sub(this.end, this.start).div(duration).mul(100) + '%'
    }
  }

  async createThumbnail() {
    const url = await renderThumbnail(filePath, this.start)
    this.thumbnail = url
  }

}