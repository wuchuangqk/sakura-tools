import path from 'node:path'
import fs from 'fs-extra'
import { exec } from 'node:child_process'

/**
 * 获取文件所在目录
 * @param filePath 
 * @returns name：文件名称，dir：文件所在目录
 */
const getFileMeta = (filePath: string) => {
  return {
    name: path.basename(filePath),
    dir: path.dirname(filePath),
    size: fs.statSync(filePath).size
  }
}

/**
 * 创建txt文本
 * @param outPathList 
 * @param dir 
 */
const createTxtFile = (outPathList: string[], dir: string) => {
      const content = outPathList.join('\n')
      fs.writeFileSync(path.join(dir, 'fileList.txt'), content, { encoding: 'utf-8' })
}

const removeFile = (pathList: string[]) => {
  pathList.forEach(p => fs.unlink(p, () => { }))
}

const openDir = (dirPath: string) => {
  if (!dirPath) return
  // start命令默认会把加引号的路径当成标题，所以要在中间加一个空引号(作为标题)来避开这个问题
  exec(`start "" "${dirPath}"`)
}

export default {
  getFileMeta,
  createTxtFile,
  removeFile,
  openDir,
}