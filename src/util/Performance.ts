import { fmtDuration } from './index'

export class Performance {
  static time: number = 0
  static start() {
    this.time = performance.now()
  }
  static end(): string {
    const milliseconds = performance.now() - this.time
    return fmtDuration(milliseconds / 1000)
  }
}
