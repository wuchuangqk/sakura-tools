import { useStore } from "@/util/store"
import { onMounted, onUnmounted, ref } from "vue"

export const useDrop = (onFileLoad: (files: FileList) => void) => {
  const store = useStore()
  const showConfirm = ref(true)
  let filesTemp: any

  // 拖拽上传
  const drop = (event: DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer === null) return
    const { files } = event.dataTransfer
    // @todo 检查文件类型是不是视频
    // call('load', files)
    // 
    if (!store.isFileOpened) {
      onFileLoad(files)
      return
    }
    filesTemp = files
    showConfirm.value = true
  }
  // 阻止默认事件，使得元素能够接收 drop 事件
  const preventDefault = (event: DragEvent) => {
    event.preventDefault()
  }
  const handleOk = () => {
    showConfirm.value = false
    store.reset()
    onFileLoad(filesTemp)
  }
  onMounted(() => {
    document.body.addEventListener('drop', drop)
    document.body.addEventListener('dragover', preventDefault)
  })
  onUnmounted(() => {
    document.body.removeEventListener('drop', drop)
    document.body.removeEventListener('dragover', preventDefault)
  })
  return {
    showConfirm,
    handleOk,
  }
}