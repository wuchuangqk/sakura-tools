import { exec } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const getPath = (cmd: string) => {
  return join(__dirname, `../ffmpeg/${cmd}.exe`)
}

const run = (args: any[]) => {
  const arg = args.reduce((prev, cur) => {
    return prev + (cur.length === 2 ? `${cur[0]} ${cur[1]} ` : `${cur[0]} `)
  }, '')
  return new Promise((resolve, reject) => {
    const ffmpegPath = getPath('ffmpeg')
    exec(`${ffmpegPath} ${arg}`, { encoding: "buffer" }, (err, sdtout, stderr) => {
      if (err) return reject(err)
      resolve(sdtout)
    })
  })
}

export default {
  run
}