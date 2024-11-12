import { MyFile } from './index'
import { useImgStore } from '@/renderer/store'
interface ICompress {
  compressedImgPath: string
  compressedSize: number
  tempImgCount: number
}

const { invoke } = window

export class ImgCompress {
  file: MyFile // 图片路径
  compressedImgPath: string = '' // 压缩后的图片路径
  compressedSize: number = 0 // 图片压缩后大小
  compressed: boolean = false // 是否压缩完成
  quality: number = 90 // 压缩质量（10-100）
  error = false // 是否压缩出错
  compressing = true // 是否压缩完成
  compresTime = 0 // 压缩用时（单位：秒）

  constructor(file: MyFile) {
    this.file = file
  }

  async compress() {
    const start = performance.now()
    try {
      this.compresTime = 0
      this.compressing = true
      this.compressed = false
      const { compressedImgPath, compressedSize, tempImgCount } = await invoke<ICompress>('compress:run', {
        filePath: this.file.path,
        extension: this.file.ext,
        quality: this.quality
      })
      this.compressedImgPath = compressedImgPath
      this.compressedSize = compressedSize
      this.compressed = true
      this.compressing = false
      const imgStore = useImgStore()
      imgStore.meta.tempImgCount = tempImgCount
    } catch (error) {
      this.compressing = false
      this.error = true
      console.log(error);
    }
    this.compresTime = Math.floor((performance.now() - start) / 1000)
  }
}