import { padStart } from 'lodash'

/**
 * 格式化视频时长
 * @param durationObj 时长
 * @returns 
 */
export const fmtDuration = (durationObj: { milliseconds: string, seconds: number, minutes: number, hours: number }) => {
  const hours = padStart(String(durationObj.hours), 2, '0')
  const minutes = padStart(String(durationObj.minutes), 2, '0')
  const seconds = padStart(String(durationObj.seconds), 2, '0')
  return `${hours}:${minutes}:${seconds}${durationObj.milliseconds.substring(1)}`
}

/**
 * 将秒格式化为时、分、秒、毫秒
 * @param duration 
 */
export const fmtSeconds = (duration: number) => {
  if (isEmpty(duration)) return { milliseconds: '0.000', seconds: 0, minutes: 0, hours: 0 }
  // Math.floor用于从小数中提取整数（parsetInt虽然也能取整，但它的参数类型是字符串，更适合字符串取整场景）
  const milliseconds = (duration - Math.floor(duration)).toFixed(3)
  const seconds = Math.floor(duration) % 60
  const minutes = Math.floor(duration / 60) % 60
  const hours = Math.floor(duration / 60 / 60)
  return { milliseconds, seconds, minutes, hours }
}

export const isEmpty = (value: string | number | object) => {
  if (typeof value === 'undefined' || value === null) {
    return true
  }
  if (typeof value === 'string') {
    return value.length === 0
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }
  return false
}

export const isNotEmpty = (value: string | object) => {
  return !isEmpty(value)
}