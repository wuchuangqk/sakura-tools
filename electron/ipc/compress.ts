import { exec } from 'node:child_process'
import { resolve } from 'node:path'
import { getBinPath, getDuplicatePath, getFileMeta, copyToTarget } from '../util'
import os from 'node:os'
import { emptyDirSync } from 'fs-extra'
import { v4 as uuidv4 } from 'uuid';
import { SaveType } from '../../common/types'
import { dialog } from 'electron'
import { win } from '../main'

interface ISave {
  imgList: { compressedPath: string, originPath: string, ext: string }[]
  saveType: SaveType
}

const tmpdir = resolve(os.tmpdir(), 'sakura') // 系统临时文件目录（C:\Users\wuchu\AppData\Local\Temp）

const commandMap = (type: string, input, output) => {
  const map = {
    'jpg': {
      bin: 'moz-cjpeg',
      args: [
        '-quality', '80',
        '-outfile', output,
        `"${input}"`,
      ]
    },
    'png': {
      bin: 'pngquant',
      args: [
        '"256"',
        `"${input}"`,
        '-o',
        output,
      ]
    },
    'webp': {
      bin: 'cwebp',
      args: [
        '-q', '80',
        `"${input}"`,
        '-o', output,
      ]
    }
  }
  return map[type]
}

const run = async (filePath: string, extension: string) => {
  if (!['jpg', 'png', 'webp'].includes(extension)) {
    return Promise.reject()
  }
  const output = resolve(tmpdir, `${uuidv4()}.${extension}`)
  console.log('output', output);
  
  return new Promise((resolve, reject) => {
    const { bin, args } = commandMap(extension, filePath, output)
    const binPath = getBinPath('compress', bin)
    const process = exec(`${binPath} ${args.join(' ')}`, (err) => {
      if (err) return reject(err)
    })
    process.on('close', async () => {
      try {
        const { size } = await getFileMeta(output)
        resolve({
          compressedImg: output,
          compressedSize: size
        })
      } catch (error) {
        console.log(error);
        reject(error)
      }
    })
  })
}

const clearTempDir = () => emptyDirSync(tmpdir)

const save = async ({ imgList, saveType }: ISave) => {
  console.log(imgList, saveType);
  
  if (saveType === SaveType.OVERWRITE) {
    imgList.forEach(({ compressedPath, originPath }) => {
      copyToTarget(compressedPath, originPath)
    })
  } else if (saveType === SaveType.SAVE_AS) {
    const { compressedPath, originPath, ext } = imgList[0]
    const { filePath } = await dialog.showSaveDialog(win, {
      title: '另存为',
      defaultPath: originPath,
      filters: [{
        name: 'Images',
        extensions: [ext]
      }]
    })
    if (filePath) {
      copyToTarget(compressedPath, filePath)
    }
  } else if (saveType === SaveType.DUPLICATE) {
    imgList.forEach(async ({ originPath, compressedPath }) => {
      const duplicatePath = await getDuplicatePath(originPath)
      copyToTarget(compressedPath, duplicatePath)
    })
  }
}

export default {
  run,
  clearTempDir,
  save,
}