import { exec } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDev, debug } from '../util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

debug(JSON.stringify({ __filename, __dirname }))
debug(process.resourcesPath)

const getPath = (cmd: string) => {
  if (isDev()) {
    return join(__dirname, `../../resources/ffmpeg/${cmd}.exe`)
  } else {
    return join(process.resourcesPath, `/ffmpeg/${cmd}.exe`)
  }
}

const run = (args: any[]) => {
  const arg = args.reduce((prev, cur) => {
    return prev + (cur.length === 2 ? `${cur[0]} ${cur[1]} ` : `${cur[0]} `)
  }, '')
  return new Promise((resolve, reject) => {
    const ffmpegPath = getPath('ffmpeg')
    debug(ffmpegPath)
    exec(`${ffmpegPath} ${arg}`, { encoding: "buffer" }, (err, sdtout, stderr) => {
      if (err) return reject(err)
      resolve(sdtout)
    })
  })
}

export default {
  run
}