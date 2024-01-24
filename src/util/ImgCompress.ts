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
  compressed: boolean = false // 
  extension: string // 图片扩展名（jpg,png,webp）
  quality: number = 80 // 压缩质量（10-100）

  constructor(path: string) {
    this.path = path
    this.extension = getFileExtension(this.path)
  }

  async setSize() {
    const { size } = await invoke<IFileMeta>('os:getFileMeta', this.path)
    this.originSize = size
  }

  async compress() {
    this.compressed = false
    const { compressedImg, compressedSize } = await invoke<ICompress>('compress:run', {
      filePath: this.path,
      extension: this.extension,
      quality: this.quality
    })
    this.compressedImg = compressedImg
    this.compressedSize = compressedSize
    this.compressed = true
  }
}