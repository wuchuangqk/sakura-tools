import { exec } from 'node:child_process'
import { debug, getBinPath } from '../util'

const run = (args: any[], cmd: string = 'ffmpeg', options = null) => {
  debug(args.join(' '))
  return new Promise((resolve, reject) => {
    try {
      const cmdPath = getBinPath('ffmpeg', cmd)
    exec(`"${cmdPath}" ${args.join(' ')}`, options, (err, sdtout, stderr) => {
      if (err) {
        console.log(err);
        return reject(err)
      }
      resolve(sdtout)
    })
    } catch (error) {
      console.log(error);
    }
  })
}

export default {
  run
}