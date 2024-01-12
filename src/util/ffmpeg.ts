import pMap from 'p-map';
import Decimal from 'decimal.js'
import { Segment } from './Segment';
import { useVideoStore } from '@/store/video';

const { invoke } = window
const THUMBNAIL_MAX = 10 // 缩略图上限

/**
 * 渲染单张缩略图
 * @param filePath 
 * @param timestamp 
 * @returns 
 */
export const renderThumbnail = async (filePath: string, timestamp: number) => {
  const args = [
    '-ss', timestamp,
    '-i', `"${filePath}"`,
    '-vf', 'scale=-2:160',
    '-f', 'image2',
    '-vframes', '1',
    '-q:v', '10',
    '-'
  ];
  // 输出图片

  const stdout = await invoke<Buffer>('ffmpeg:run', args, 'ffmpeg', { encoding: "buffer" })
  const blob = new Blob([stdout], { type: 'image/jpeg' });
  return URL.createObjectURL(blob);
}

/**
 * 批量渲染缩略图
 */
export const renderThumbnails = async ({ from, duration, onThumbnail }: { from: number, duration: number, onThumbnail: Function }) => {
  const { filePath } = useVideoStore().projectMeta
  const thumbTimes = Array(THUMBNAIL_MAX).fill(null).map((unused, i) => from + (duration * i / THUMBNAIL_MAX));
  console.log('缩略图时间点：', thumbTimes);

  // concurrency:控制并发数
  await pMap(thumbTimes, async (time) => {
    const url = await renderThumbnail(filePath, time)
    onThumbnail({ time, url })
  }, { concurrency: 4 });
}

export const queryKeyFrames = async ({ duration }: { duration: number }) => {
  const { filePath } = useVideoStore().projectMeta
  const args = [
    '-v', 'error',
    '-read_intervals', `0%20`,
    '-show_packets',
    '-select_streams', '0',
    '-show_entries', 'packet=pts_time,flags',
    '-of', 'json',
    `"${filePath}"`
  ]
  const stdout = await invoke<string>('ffmpeg:run', args, 'ffprobe');

  // 筛选关键帧
  const { packets } = JSON.parse(stdout)
  const ptsTimeList = packets
    .filter((val: any) => val.flags === 'K__')
    .map((val: any) => parseFloat(val.pts_time))

  // 通过关键帧间隔，推算出所有关键帧时间点
  if (ptsTimeList.length >= 2) {
    // 第一个关键帧时间点是一定0秒，所以第二个关键帧时间点就是间隔时间
    const interval = ptsTimeList[1]
    const count = Decimal.div(duration, interval).toNumber()
    const keyFrames = []
    for (let i = 0; i < count; i++) {
      keyFrames.push(Decimal.mul(interval, i).toNumber())
    }
    return keyFrames
  } else {
    return []
  }
}

/**
 * 截取视频
 * @param param0 from:开始时间 duration:截取的长度（单位：秒）
 */
export const cutVideo1 = async ({ filePath, from, duration }: { filePath: string, from: number, duration: number }) => {
  const outPath = getOutPath(filePath)
  console.log('outPath', outPath);
  const args = [
    '-ss', from,
    '-i', `"${filePath}"`,
    '-t', duration,
    '-avoid_negative_ts', 'make_zero',
    '-map', '0:0',
    '-c:0', 'copy ',
    '-tag:0', 'hvc1 ',
    '-map', '0:1',
    '-c:1', 'copy',
    '-map_metadata', '0',
    '-movflags', '+faststart',
    '-default_mode', 'infer_no_subs',
    '-ignore_unknown',
    '-f', 'mp4',
    '-y',
    outPath,
  ]
  await invoke('ffmpeg:run', args)
}

const getOutPath = (filePath: string) => {
  const path = filePath.substring(0, filePath.lastIndexOf('.'))
  const suffix = filePath.substring(filePath.lastIndexOf('.'))
  const random = Math.floor(Math.random() * (10000 - 999 + 1) + 999);
  return `"${path}-sakura${random}${suffix}"`
}

const cutVideo = async ({ filePath, outPath, from, duration }: { filePath: string, outPath: string, from: number, duration: number }) => {
  const args = [
    '-ss', from,
    '-t', duration,
    '-i', `"${filePath}"`,
    '-vcodec', 'copy',
    '-acodec', 'copy',
    `"${outPath}"`,
  ]
  await invoke('ffmpeg:run', args)
}

const mergeVideo = async (outPath: string, fileListPath: string) => {
  const args = [
    '-hide_banner',
    '-f', 'concat',
    '-safe', '0',
    '-i', `"${fileListPath}"`,
    '-c', 'copy',
    outPath,
  ]
  await invoke('ffmpeg:run', args)
}

export const cutAndMergeVideo = async (segmentList: Segment[]) => {
  const { filePath, outDir } = useVideoStore().projectMeta

  // 分割并记录输出文件路径
  const outPathList: string[] = []
  const tasks = segmentList.map(seg => {
    const outPath = getOutPath(filePath).replaceAll(`"`, '')
    outPathList.push(outPath)
    return cutVideo({ filePath, outPath, from: seg.start, duration: Decimal.sub(seg.end, seg.start).toNumber() })
  })
  await Promise.all(tasks)
  await invoke('os:createTxtFile', outPathList.map(path => `file 'file:${path}'`), outDir)

  // 合并
  const outPath = getOutPath(filePath)
  const fileListPath = `${outDir}\\fileList.txt`
  await mergeVideo(outPath, fileListPath)

  // 删除临时文件
  invoke('os:removeFile', [fileListPath, ...outPathList])
}