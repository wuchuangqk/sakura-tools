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
  const options = {
    hostname: 'localhost',
    port: 9000,
    method: 'POST',
    path: '/'
  }
  // const req = http.request(options)
  // req.write(info)
  // req.end()
}

export const getFileSize = (filePath: string) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.log(err);
        return reject(err)
      }
      resolve(stats.size)
    })
  })
}

export const getBinPath = (fold: string, bin: string) => {
  if (isDev) {
    return join(__dirname, `../../resources/${fold}/${bin}.exe`)
  } else {
    return join(process.resourcesPath, `/${fold}/${bin}.exe`)
  }
}