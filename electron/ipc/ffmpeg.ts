import { exec } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDev, debug } from '../util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const getPath = (cmd: string) => {
  if (isDev) {
    return join(__dirname, `../../resources/ffmpeg/${cmd}.exe`)
  } else {
    return join(process.resourcesPath, `/ffmpeg/${cmd}.exe`)
  }
}

const run = (args: any[], cmd: string = 'ffmpeg', options = null) => {
  debug(args.join(' '))
  return new Promise((resolve, reject) => {
    const cmdPath = getPath(cmd)
    exec(`${cmdPath} ${args.join(' ')}`, options, (err, sdtout, stderr) => {
      if (err) return reject(err)
      resolve(sdtout)
    })
  })
}

export default {
  run
}