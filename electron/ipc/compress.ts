import { exec } from 'node:child_process'
import { resolve } from 'node:path'
import { getBinPath, getFileSize } from '../util'
import os from 'node:os'
import { emptyDirSync } from 'fs-extra'
import { v4 as uuidv4 } from 'uuid';

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
  return new Promise((resolve, reject) => {
    const { bin, args } = commandMap(extension, filePath, output)
    const binPath = getBinPath('compress', bin)
    const process = exec(`${binPath} ${args.join(' ')}`, (err) => {
      if (err) return reject(err)
    })
    process.on('error', (err) => reject(err))
    process.on('close', async () => {
      try {
        const size = await getFileSize(output)
        resolve({
          compressedImg: output,
          compressedSize: size
        })
      } catch (error) {
        reject(error)
      }
    })
  })
}

const clearTempDir = () => emptyDirSync(tmpdir)

export default {
  run,
  clearTempDir,
}