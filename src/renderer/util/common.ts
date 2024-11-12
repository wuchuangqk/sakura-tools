import { padStart } from 'lodash'
import mitt from 'mitt'

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
  return `${hours}:${minutes}:${seconds}:${value.milliseconds.substring(2)}`
}

/**
 * 将秒格式化为时、分、秒、毫秒
 * @param duration 
 */
export const fmtSeconds = (duration: number) => {
  if (isEmpty(duration)) return { milliseconds: '0.00', seconds: 0, minutes: 0, hours: 0 }
  // Math.floor用于从小数中提取整数（parsetInt虽然也能取整，但它的参数类型是字符串，更适合字符串取整场景）
  const milliseconds = (duration - Math.floor(duration)).toFixed(2)
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

/**
 * 把格式化的时分秒反向解析回秒
 * @param time 
 */
export const reverseToSecond = (time: string) => {
  const match = time.match(/^(\d{2}):(\d{2}):(\d{2}):(\d{2})$/);
  if (match === null) return 0
  const [, hourStr, minStr, secStr, milliStr] = match
  // 小时*60=分钟数，总的分钟数*60=秒数，毫秒/100=转换成两位小数
  const seconds = (parseInt(hourStr) * 60 + parseInt(minStr)) * 60 + parseInt(secStr) + (parseInt(milliStr) / 100)
  console.log(match, seconds);
  return seconds
}

/**
 * 取平均中位数
 */
export const getAvgNums = (arr: number[], max: number) => {
  function center(result: { index: number, value: number }[]) {
    if (result.length === 0) {
      result = [
        { index: 0, value: arr[0] },
        { index: Math.floor(arr.length / 2), value: arr[Math.floor(arr.length / 2)] },
        { index: arr.length - 1, value: arr[arr.length - 1] },
      ]
    }
    // 取相邻两个元素的中间数
    for (let i = 0; i < result.length - 1; i++) {
      const curIndex = result[i].index
      const nextIndex = result[i + 1].index
      if (nextIndex - curIndex <= 1 || result.length === max) {
        return result
      }
      const avgIndex = Math.floor((nextIndex - curIndex) / 2) + curIndex
      result.splice(i + 1, 0, { index: avgIndex, value: arr[avgIndex] })
      i++
    }
    return center(result)
  }
  if (arr.length <= max) {
    return arr
  }
  const result = center([])
  return result.map(v => v.value)
}

export const fmtFileSize = (bytes: number) => {
  if (bytes == 0) return "0";
  let k = 1024,
    sizes = ["", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i]
  );
}

export const emitter = mitt();

export const getFileExtension = (filePath: string): string => {
  const aliasMap: any = {
    'jpeg': 'jpg',
  }
  if (!filePath) return ''
  const extension = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase()
  return aliasMap[extension] || extension
}

/**
 * 获取文件所在目录，从完整文件路径中去掉文件名
 * @param path 完整路径
 * @param name 文件名
 * @returns 
 */
export const getDirname = (path: string, name: string) => {
  return path.substring(0, path.lastIndexOf(name))
}