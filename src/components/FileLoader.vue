<template>
  <div class="h-full" @click="click" @dragover="preventDefault" @drop="drop">
    点击或拖拽文件到这里
    <input ref="inputRef" type="file" class=" hidden" accept=".mp4,.mkv" @change="change">
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const call = defineEmits<{
  load: [files: FileList]
}>()

const inputRef = ref(null as unknown as HTMLInputElement)

const click = () => {
  inputRef.value.click()
}
// 阻止默认事件，使得元素能够接收 drop 事件
const preventDefault = (event: DragEvent) => {
  event.preventDefault()
}
// 拖拽上传
const drop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer === null) return
  const { files } = event.dataTransfer
  // @todo 检查文件类型是不是视频
  call('load', files)
}
const change = (event: Event) => {
  const { files } = event.target as HTMLInputElement
  if (files === null) return
  call('load', files)
}
</script>

<style lang="scss" scoped></style>