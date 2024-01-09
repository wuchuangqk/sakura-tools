import http from 'node:http'

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