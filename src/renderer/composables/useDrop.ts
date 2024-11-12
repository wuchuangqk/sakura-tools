import { onMounted, onUnmounted } from "vue"
import { emitter, C, MyFile } from '@/renderer/util'

export const useDrop = () => {
  // 拖拽上传
  const drop = (event: DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer === null) return
    const { files } = event.dataTransfer
    if (files.length) {
      const myFiles = []
      for (let i = 0; i < files.length; i++) {
        myFiles.push(new MyFile(files[i]))
      }
      emitter.emit(C.USER_DROP_FILE, myFiles)
    }
  }
  // 阻止默认事件，使得元素能够接收 drop 事件
  const preventDefault = (event: DragEvent) => {
    event.preventDefault()
  }
  onMounted(() => {
    document.body.addEventListener('drop', drop)
    document.body.addEventListener('dragover', preventDefault)
  })
  onUnmounted(() => {
    document.body.removeEventListener('drop', drop)
    document.body.removeEventListener('dragover', preventDefault)
  })
}