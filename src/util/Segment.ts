import Decimal from "decimal.js"

export class Segment {
  start: number
  end: number
  left: string = '0'
  width: string = '0'
  videoDuration: number

  constructor(videoDuration: number, start: number = 0, end: number = 0) {
    this.videoDuration = videoDuration
    this.start = start
    this.end = end
    this.left = Decimal.div(this.start, this.videoDuration).mul(100) + '%'
    this.width = Decimal.sub(this.end, this.start).div(this.videoDuration).mul(100) + '%'
  }

  setStart(start: number) {
    const _start = this.start
    this.start = start
    this.left = Decimal.div(this.start, this.videoDuration).mul(100) + '%'
    // 时间点发生变动，更新片段长度
    if (this.start !== _start) {
      this.width = Decimal.sub(this.end, this.start).div(this.videoDuration).mul(100) + '%'
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
}