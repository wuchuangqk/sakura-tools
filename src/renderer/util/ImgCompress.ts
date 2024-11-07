import { getFileExtension } from './index'

interface ICompress {
  compressedImg: string
  compressedSize: number
}

const { invoke } = window

export class ImgCompress {
  path: string // 图片路径
  compressedImg: string = '' // 压缩后的图片路径
  originSize: number = 0 // 图片原始大小
  compressedSize: number = 0 // 图片压缩后大小
  compressed: boolean = false // 是否压缩完成
  extension: string // 图片扩展名（jpg,png,webp）
  quality: number = 90 // 压缩质量（10-100）
  error = false // 是否压缩出错
  compressing = true // 是否压缩完成
  compresTime = 0 // 压缩用时（单位：秒）

  constructor(path: string) {
    this.path = path
    this.extension = getFileExtension(this.path)
  }

  async setSize() {
    const { size } = await invoke<IFileMeta>('os:getFileMeta', this.path)
    this.originSize = size
  }

  async compress() {
    const start = performance.now()
    try {
      this.compresTime = 0
      this.compressing = true
      this.compressed = false
      const { compressedImg, compressedSize } = await invoke<ICompress>('compress:run', {
        filePath: this.path,
        extension: this.extension,
        quality: this.quality
      })
      this.compressedImg = compressedImg
      this.compressedSize = compressedSize
      this.compressed = true
      this.compressing = false
    } catch (error) {
      this.compressing = false
      this.error = true
      console.log(error);
    }
    this.compresTime = Math.floor((performance.now() - start) / 1000)
  }
}