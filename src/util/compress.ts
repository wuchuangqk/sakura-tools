const { invoke } = window

interface ICompress {
  compressedImg: string
  compressedSize: number
}

export const compress = async (imgPath: string, extension: string) => {
  return await invoke<ICompress>('compress:run', imgPath, extension)
}