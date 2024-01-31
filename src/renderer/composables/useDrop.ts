import { onMounted, onUnmounted } from "vue"
import { emitter, C } from '@/renderer/util'

export const useDrop = () => {
  // 拖拽上传
  const drop = (event: DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer === null) return
    const { files } = event.dataTransfer
    if (files.length) {
      emitter.emit(C.USER_DROP_FILE, files)
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