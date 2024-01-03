import { padStart } from 'lodash'

/**
 * 格式化视频时长
 * @param value 
 * @returns 
 */
export const fmtDuration = (value: { milliseconds: string, seconds: number, minutes: number, hours: number } | number): string => {
  if (isEmpty(value)) return ''
  if (typeof value === 'number') return fmtDuration(fmtSeconds(value))
  const hours = padStart(String(value.hours), 2, '0')
  const minutes = padStart(String(value.minutes), 2, '0')
  const seconds = padStart(String(value.seconds), 2, '0')
  return `${hours}:${minutes}:${seconds}${value.milliseconds.substring(1)}`
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

export const isEmpty = (value: any) => {
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

export const isNotEmpty = (value: any) => {
  return !isEmpty(value)
}