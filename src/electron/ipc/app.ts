import { app } from 'electron'

const getVersion = () => {
  return app.getVersion()
}

const getName = () => {
  return app.getName()
}

export default {
  getVersion,
  getName,
}