import path from 'node:path'
import fs from 'node:fs'

const getFileMeta = (filePath: string) => {
  return {
    name: path.basename(filePath),
    dir: path.dirname(filePath)
  }
}

const createTxt = async (outPathList: string[], dir) => {
  const content = outPathList.join('\n')
  await fs.writeFileSync(path.join(dir, 'fileList.txt'), content, { encoding: 'utf-8' })
}

const removeFile = (pathList: string[]) => {
  pathList.forEach(p => fs.unlink(p, () => { }))
}

export default {
  getFileMeta,
  createTxt,
  removeFile,
}