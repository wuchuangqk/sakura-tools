import { getFileExtension, fmtFileSize, getDirname } from './common'

const { webUtils } = window

export class MyFile {
  path: string = '' // 文件完整路径
  name: string = '' // 文件名
  ext: string = '' // 扩展名
  dir: string = '' // 所在目录
  size: number = 0 // 文件大小
  sizeFmt: string = '' // 文件大小格式化

  constructor(file: File) {
    this.name = file.name
    this.ext = getFileExtension(this.name)
    this.path = webUtils.getPathForFile(file)
    this.size = file.size
    this.sizeFmt = fmtFileSize(this.size)
    this.dir = getDirname(this.path, this.name)
  }
}