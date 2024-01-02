import http from 'node:http'

export const isDev = () => {
  return !!process.env.VITE_DEV_SERVER_URL
}

export const debug = (info: any) => {
  const options = {
    hostname: 'localhost',
    port: 9000,
    method: 'POST',
    path: '/'
  }
  const req = http.request(options)
  req.write(info)
  req.end()
}