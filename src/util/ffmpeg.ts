import pMap from 'p-map';
import Decimal from 'decimal.js'

const { ffmpeg } = window.IPC
const THUMBNAIL_MAX = 10 // 缩略图上限

/**
 * 渲染单张缩略图
 * @param filePath 
 * @param timestamp 
 * @returns 
 */
const renderThumbnail = async (filePath: string, timestamp: number) => {
  const args = [
    '-ss', timestamp,
    '-i', `"${filePath}"`,
    '-vf', 'scale=-2:200',
    '-f', 'image2',
    '-vframes', '1',
    '-q:v', '10',
    '-'
  ];
  // 输出图片
  const stdout = await ffmpeg.run(args, 'ffmpeg', { encoding: "buffer" });
  const blob = new Blob([stdout], { type: 'image/jpeg' });
  return URL.createObjectURL(blob);
}

/**
 * 批量渲染缩略图
 */
export const renderThumbnails = async ({ filePath, from, duration, onThumbnail }: { filePath: string, from: number, duration: number, onThumbnail: Function }) => {
  const thumbTimes = Array(THUMBNAIL_MAX).fill(null).map((unused, i) => from + (duration * i / THUMBNAIL_MAX));
  console.log('缩略图时间点：', thumbTimes);

  // concurrency:控制并发数
  await pMap(thumbTimes, async (time) => {
    const url = await renderThumbnail(filePath, time)
    onThumbnail({ time, url })
  }, { concurrency: 2 });
}

export const queryKeyFrames = async ({ filePath, duration }: { filePath: string, duration: number }) => {
  const args = [
    '-v', 'error',
    '-read_intervals', `0%20`,
    '-show_packets',
    '-select_streams', '0',
    '-show_entries', 'packet=pts_time,flags',
    '-of', 'json',
    `"${filePath}"`
  ]
  const stdout = await ffmpeg.run(args, 'ffprobe') as string;

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
export const cutVideo = async ({ filePath, from, duration }: { filePath: string, from: number, duration: number }) => {
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
  await ffmpeg.run(args)
}

const getOutPath = (filePath: string) => {
  const path = filePath.substring(0, filePath.lastIndexOf('.'))
  const suffix = filePath.substring(filePath.lastIndexOf('.'))
  return `"${path}-sakura${new Date().getTime()}${suffix}"`
}