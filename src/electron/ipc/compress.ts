import { exec } from 'node:child_process'
import { resolve, join } from 'node:path'
import { getBinPath, getDuplicatePath, getFileMeta, copyToTarget } from '../util'
import os from 'node:os'
import { emptyDirSync } from 'fs-extra'
import { v4 as uuidv4 } from 'uuid';
import { SaveType } from '../../common/types'
import { dialog } from 'electron'
import { win } from '../main'
import { readdirSync, statSync } from 'node:fs'
import logger from 'electron-log/renderer'

interface ISave {
  imgList: { compressedPath: string, originPath: string, ext: string, name: string, dir: string }[]
  saveType: SaveType
}

const tmpdir = resolve(os.tmpdir(), 'sakura') // 系统临时文件目录（C:\Users\wuchu\AppData\Local\Temp）

const commandMap = (type: string, input: string, output: string, quality: number) => {
  const map = {
    'jpg': {
      bin: 'moz-cjpeg',
      args: [
        '-quality', quality,
        '-outfile', output,
        `"${input}"`,
      ]
    },
    'png': {
      bin: 'pngquant',
      args: [
        '--quality=0-100',
        '--output', output,
        `"${input}"`,
      ]
    },
    'webp': {
      bin: 'cwebp',
      args: [
        '-q', quality,
        `"${input}"`,
        '-o', output,
      ]
    }
  }
  return map[type]
}

/** 获取临时生成的图片数量 */
const getTempImgCount = () => {
  try {
    const fileNames = readdirSync(tmpdir)
    let count = 0
    fileNames.forEach(fileName => {
      const filePath = join(tmpdir, fileName)
      const stats = statSync(filePath)
      if (stats.isFile()) {
        count++
      }
    })
    return count
  } catch (error) {
    return 0
  }
}

const run = async ({ filePath, extension, quality }: { filePath: string, extension: string, quality: number }) => {
  if (!['jpg', 'png', 'webp'].includes(extension)) {
    return Promise.reject()
  }
  const output = resolve(tmpdir, `${uuidv4()}.${extension}`)
  logger.info('压缩图片输出位置：', output)

  return new Promise((resolve, reject) => {
    const { bin, args } = commandMap(extension, filePath, output, quality)
    const binPath = getBinPath('compress', bin)
    const process = exec(`"${binPath}" ${args.join(' ')}`, (err) => {
      if (err) {
        console.log(err);
        return reject(err)
      }
    })
    process.on('close', async () => {
      try {
        const { size } = await getFileMeta(output)
        const tempImgCount = getTempImgCount()
        resolve({
          compressedImgPath: output,
          compressedSize: size,
          tempImgCount,
        })
      } catch (error) {
        console.log(error);
        reject(error)
      }
    })
  })
}

// 清空临时目录
const clearTempDir = () => emptyDirSync(tmpdir)

const save = ({ imgList, saveType }: ISave) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      if (saveType === SaveType.OVERWRITE) {
        imgList.forEach(({ compressedPath, originPath }) => {
          copyToTarget(compressedPath, originPath)
        })
      } else if (saveType === SaveType.SAVE_AS) {
        const { compressedPath, ext, name, dir } = imgList[0]
        const newName = name.substring(0, name.lastIndexOf('.')) + '副本' + '.' + ext
        const defaultPath = join(dir, newName)
        logger.info('另存为：', compressedPath, defaultPath, ext)
        const { filePath, canceled } = await dialog.showSaveDialog(win!, {
          title: '另存为',
          defaultPath,
          filters: [{
            name: 'Images',
            extensions: [ext]
          }]
        })
        if (!canceled) {
          logger.info('另存为地址：', filePath)
          copyToTarget(compressedPath, filePath)
        } else {
          logger.info('用户取消另存为')
        }
      } else if (saveType === SaveType.DUPLICATE) {
        imgList.forEach(async ({ originPath, compressedPath }) => {
          const duplicatePath = await getDuplicatePath(originPath)
          copyToTarget(compressedPath, duplicatePath)
        })
      }
      resolve()
    } catch (error) {
      logger.info('save error', error)
      reject(error)
    }
  })
}

export default {
  tmpdir,
  run,
  clearTempDir,
  save,
}