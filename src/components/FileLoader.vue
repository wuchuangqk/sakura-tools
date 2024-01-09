<template>
  <div class="h-full" @click="click">
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

const change = (event: Event) => {
  const { files } = event.target as HTMLInputElement
  if (files === null) return
  call('load', files)
}
</script>

<style lang="scss" scoped></style>