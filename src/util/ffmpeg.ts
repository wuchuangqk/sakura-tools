import pMap from 'p-map';

const { ffmpeg } = window.IPC
const THUMBNAIL_MAX = 2 // 缩略图上限

/**
 * 渲染单张缩略图
 * @param filePath 
 * @param timestamp 
 * @returns 
 */
const renderThumbnail = async (filePath: string, timestamp: number) => {
  const args = [
    ['-ss', timestamp,],
    ['-i', filePath,],
    ['-vf', 'scale=-2:200',],
    ['-f', 'image2',],
    ['-vframes', '1',],
    ['-q:v', '10',],
    ['-']
  ];
  // 输出图片
  const stdout = await ffmpeg.runFfmpeg(args);
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