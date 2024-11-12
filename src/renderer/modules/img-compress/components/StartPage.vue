<template>
  <div class="h-full start-page" @click="() => open()">
    <div class="h-full flex flex-col justify-center items-center">
      <!-- <img :src="appImg" alt="" style="border-radius: 50%;width: 160px;margin-bottom: 20px;"> -->
      <div style="font-size: 30px;margin-bottom: 80px;">{{ appMeta.name }}</div>
      <div>点击或拖拽图片到这里</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import appImg from '@/renderer/assets/app.ico'
import { useVideoStore } from '@/renderer/store'
import { MyFile } from '@/renderer/util';
import { useFileDialog } from '@vueuse/core'

const call = defineEmits<{
  load: [files: MyFile[]]
}>()

const store = useVideoStore()
const appMeta = store.appMeta

const { open, onChange } = useFileDialog({
  multiple: true,
  accept: 'image/*',
  directory: false,
})
onChange((files) => {
  if (files === null || files.length === 0) return
  const myFiles = []
  for (let i = 0; i < files.length; i++) {
    myFiles.push(new MyFile(files[i]))
  }
  call('load', myFiles)
})

</script>

<style lang="scss" scoped>
.start-page {
  // background: url('@/assets/banner.jpg') no-repeat;
  background-size: cover;
}
</style>