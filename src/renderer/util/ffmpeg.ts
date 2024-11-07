import pMap from 'p-map';
import Decimal from 'decimal.js'
import { Segment } from './Segment';
import { useVideoStore } from '@/renderer/store/video';

const { invoke } = window
const THUMBNAIL_MAX = 20 // 缩略图上限

/**
 * 渲染单张缩略图
 * @param filePath 
 * @param timestamp 
 * @param height 缩略图高度 
 * @returns 
 */
const renderThumbnail = async (filePath: string, timestamp: number, height = 80) => {
  const args = [
    '-ss', timestamp,
    '-i', `"${filePath}"`,
    '-vf', `scale=-2:${height}`,
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
const renderThumbnails = async ({ from, duration, onThumbnail }: { from: number, duration: number, onThumbnail: Function }) => {
  const { filePath } = useVideoStore().projectMeta
  const thumbTimes = Array(THUMBNAIL_MAX).fill(null).map((unused, i) => from + (duration * i / THUMBNAIL_MAX));
  console.log('缩略图时间点：', thumbTimes);

  // concurrency:控制并发数
  await pMap(thumbTimes, async (time) => {
    const url = await renderThumbnail(filePath, time)
    onThumbnail({ time, url })
  }, { concurrency: 4 });
}

const queryKeyFrames = async ({ duration }: { duration: number }) => {
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
    // 通过前两个关键帧，来计算出关键帧间隔时间
    const interval = Decimal.sub(ptsTimeList[1], ptsTimeList[0])
    // 推算出所有的关键帧
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

let seed = 1
const getOutPath = (filePath: string) => {
  const path = filePath.substring(0, filePath.lastIndexOf('.'))
  const suffix = filePath.substring(filePath.lastIndexOf('.'))
  seed++
  return `"${path}-sakura-${new Date().getTime()}-${seed}${suffix}"`
}

const cutVideo = async ({ filePath, outPath, from, end }: { filePath: string, outPath: string, from: number, end: number }) => {
  const args = [
    '-ss', from,
    '-to', end,
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
    // '-map', '0:0',
    // '-c:0', 'copy',
    // '-disposition:0', 'default',
    // '-map', '0:1',
    // '-c:1', 'copy',
    // '-disposition:1', 'default',
    outPath,
  ]
  await invoke('ffmpeg:run', args)
}

const cutAndMergeVideo = async (segmentList: Segment[]) => {
  const {projectMeta} = useVideoStore()
  const { filePath, outDir } = projectMeta

  // 分割并记录输出文件路径
  const outPathList: string[] = []
  const tasks = segmentList.map(seg => {
    const outPath = getOutPath(filePath).replaceAll(`"`, '')
    outPathList.push(outPath)
    // 将时间点替换为更准确的关键帧
    return cutVideo({ filePath, outPath, from: seg.start, end: seg.end })
  })
  await Promise.all(tasks)
  console.log('cutVideo完毕');
  await invoke('os:createTxtFile', outPathList.map(path => `file 'file:${path}'`), outDir)
  console.log('createTxtFile完毕');
  // 合并
  const outPath = getOutPath(filePath)
  const fileListPath = `${outDir}\\fileList.txt`
  await mergeVideo(outPath, fileListPath)
  console.log('mergeVideo完毕');
  // 删除临时文件
  invoke('os:removeFile', [fileListPath, ...outPathList])
}

export {
  renderThumbnail,
  renderThumbnails,
  queryKeyFrames,
  cutAndMergeVideo,
}