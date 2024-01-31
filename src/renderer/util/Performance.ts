import { fmtDuration } from './index'
/**
 * 计算代码执行用时
 */
export class Performance {
  static time: number = 0
  // 记录开始时间
  static start() {
    this.time = performance.now()
  }
  // 计算用时
  static end(): string {
    const milliseconds = performance.now() - this.time
    return fmtDuration(milliseconds / 1000)
  }
}
