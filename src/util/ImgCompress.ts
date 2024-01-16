import { getFileExtension } from './index'

interface ICompress {
  compressedImg: string
  compressedSize: number
}

const { invoke } = window

export class ImgCompress {
  path: string
  compressedImg: string = ''
  originSize: number = 0
  compressedSize: number = 0
  loading: boolean = true
  extension: string
  quality: number = 80

  constructor(path: string) {
    this.path = path
    this.extension = getFileExtension(this.path)
  }

  async setSize() {
    const { size } = await invoke<IFileMeta>('os:getFileMeta', this.path)
    this.originSize = size
  }

  async compress() {
    this.loading = true
    const { compressedImg, compressedSize } = await invoke<ICompress>('compress:run', {
      filePath: this.path,
      extension: this.extension,
      quality: this.quality
    })
    this.compressedImg = compressedImg
    this.compressedSize = compressedSize
    this.loading = false
  }
}