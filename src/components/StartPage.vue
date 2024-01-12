<template>
  <div class="h-full start-page" @click="click">
    <div class="h-full bg-black/80 flex flex-col justify-center items-center">
      <img :src="appImg" alt="" style="border-radius: 50%;width: 160px;margin-bottom: 20px;">
      <div style="font-size: 30px;margin-bottom: 80px;">{{ appMeta.name }}</div>
      <div>点击或拖拽文件到这里</div>
    </div>
    <input ref="inputRef" type="file" class=" hidden" accept=".mp4,.mkv" @change="change">
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import appImg from '@/assets/app.ico'
import { useVideoStore } from '@/store/video'

const call = defineEmits<{
  load: [files: FileList]
}>()

const store = useVideoStore()
const appMeta = store.appMeta

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

<style lang="scss" scoped>
.start-page {
  background: url('@/assets/banner.jpg') no-repeat;
  background-size: cover;
}
</style>