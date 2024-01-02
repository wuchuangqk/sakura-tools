import pMap from 'p-map';

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
    ['-ss', timestamp,],
    ['-i', `"${filePath}"`,],
    ['-vf', 'scale=-2:200',],
    ['-f', 'image2',],
    ['-vframes', '1',],
    ['-q:v', '10',],
    ['-']
  ];
  // 输出图片
  const stdout = await ffmpeg.run('ffmpeg', args);
  const blob = new Blob([stdout], { type: 'image/jpeg' });
  return URL.createObjectURL(blob);
}

/**
 * 批量渲染缩略图
 */
export const renderThumbnails = async ({ filePath, from, duration, onThumbnail }: { filePath: string, from: number, duration: number, onThumbnail: Function }) => {
  const thumbTimes = Array(THUMBNAIL_MAX).fill(null).map((unused, i) => from + (duration * i / THUMBNAIL_MAX));
  console.log('缩略图时间点：', thumbTimes);

  await pMap(thumbTimes, async (time) => {
    const url = await renderThumbnail(filePath, time)
    onThumbnail({ time, url })
  }, { concurrency: 2 });
}

export const getKeyFrames = async ({ filePath, from, duration }: { filePath: string, from: number, duration: number }) => {
  const args = [
    ['-v', 'error'],
    ['-read_intervals', `${from}%${duration}`],
    ['-show_packets'],
    ['-select_streams', 0],
    ['-show_entries', 'packet=pts_time,flags'],
    ['-of', 'json'],
    [`"${filePath}"`]
  ]
  const stdout = await ffmpeg.run('ffprobe', args) as string;
  console.log(typeof stdout, stdout);
  // 筛选关键帧
  const { packets } = JSON.parse(stdout)
  return packets
    .filter((val: any) => val.flags === 'K__')
    .map((val: any) => val.pts_time)
}