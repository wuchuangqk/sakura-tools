import { getFileExtension } from './index'
import { compress as compressImg } from './compress'

const { invoke } = window

export class ImgCompress {
  path: string
  compressedImg: string = ''
  originSize: number = 0
  compressedSize: number = 0
  loading: boolean = true
  extension: string

  constructor(path: string) {
    this.path = path
    this.extension = getFileExtension(this.path)
  }

  // 覆盖保存
  save() {

  }

  // 另存为
  saveAs() {

  }

  async setSize() {
    const { size } = await invoke<IFileMeta>('os:getFileMeta', this.path)
    this.originSize = size
  }

  async compress() {
    const { compressedImg, compressedSize } = await compressImg(this.path, this.extension)
    this.compressedImg = compressedImg
    this.compressedSize = compressedSize
    this.loading = false
  }
}