import http from 'node:http'
import fs from 'fs-extra'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const isDev = !!process.env.VITE_DEV_SERVER_URL

/**
 * 开发环境本地调试
 * @param info 
 * @returns 
 */
export const debug = (info: string | Buffer | Uint8Array) => {
  if (!isDev) return
  // const options = {
  //   hostname: 'localhost',
  //   port: 9000,
  //   method: 'POST',
  //   path: '/'
  // }
  // const req = http.request(options)
  // req.write(info)
  // req.end()
  console.log(info);
}

export const getBinPath = (fold: string, bin: string) => {
  if (isDev) {
    return join(__dirname, `../../resources/${fold}/${bin}.exe`)
  } else {
    return join(process.resourcesPath, `/${fold}/${bin}.exe`)
  }
}

/* file工具方法 */

/**
 * 获取文件信息
 * @param filePath 
 * @returns 
 */
export const getFileMeta = (filePath: string): Promise<fs.Stats> => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.log(err);
        return reject(err)
      }
      resolve(stats)
    })
  })
}

/**
 * 如果文件夹存在，则清空文件夹内容
 * 如果文件夹不存在，则创建此文件夹
 * @param dirPath 
 */
export const clearOrCreateDir = (dirPath: string) => {
  fs.emptyDirSync(dirPath)
}

/**
 * 将现有文件拷贝到指定位置，如果该位置已存在则覆盖
 * @param filePath 
 * @param targetPath 
 */
export const copyToTarget = (filePath: string, targetPath: string) => {
  fs.copySync(filePath, targetPath)
}

/**
 * 文件副本名称生成规则
 * 例如: `/path/to/a.txt` to `/path/to/a(1).txt`
 * @param filePath - original file path
 */
export const getDuplicatePath = (filePath: string, index = 0): Promise<string> => {
  const accessPath = index
    ? filePath.replace(/(\.\w+)?$/, `(${index})$1`)
    : filePath

  // 试图去访问这个地址，如果已存在则递增索引
  // 如果抛出错误，说明不存在这个地址，是可用的
  return fs.access(accessPath)
    .then(() => getDuplicatePath(filePath, index + 1))
    .catch(() => accessPath)
}