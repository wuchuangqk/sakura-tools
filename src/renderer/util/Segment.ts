import Decimal from "decimal.js"
import { renderThumbnail } from './ffmpeg'
import { debounce } from 'lodash'
import { useVideoStore } from '@/renderer/store/video'

let duration = 0
let filePath = ''
export class Segment {
  start: number // 开始时间点
  end: number // 结束时间点
  left: string // 距离时间轴起点的距离
  width: string // 在时间轴上的长度
  thumbnail: string = '' // 片段封面
  updateThumbnail: Function // 更新片段封面
  key: symbol

  constructor(start: number = 0, end: number = 0) {
    const store = useVideoStore()
    duration = store.videoMeta.duration
    filePath = store.projectMeta.filePath

    this.start = start
    this.end = end
    this.left = Decimal.div(this.start, duration).mul(100) + '%'
    this.width = Decimal.sub(this.end, this.start).div(duration).mul(100) + '%'
    this.key = Symbol()
    this.updateThumbnail = debounce(this.createThumbnail, 600)
  }

  /**
   * 设置片段起点
   * @param start 
   */
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

  /**
   * 设置片段终点
   * @param end 
   */
  setEnd(end: number) {
    const _end = this.end
    this.end = end
    // 时间点发生变动，更新片段长度
    if (this.end !== _end) {
      this.width = Decimal.sub(this.end, this.start).div(duration).mul(100) + '%'
    }
  }

  /**
   * 生成缩略图
   */
  async createThumbnail() {
    const url = await renderThumbnail(filePath, this.start)
    this.thumbnail = url
  }

}