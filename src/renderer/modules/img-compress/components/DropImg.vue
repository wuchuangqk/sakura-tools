<template>
  <div class="h-full relative" @drop="onDrop" @dragover="onDragover">
    <img v-if="imgPath" ref="img" :src="imgPath" alt="" class="img" :style="imgStyle">
  </div>
</template>

<script setup lang="ts">
import { MyFile } from '@/renderer/util';
import { ref, StyleValue } from 'vue';

defineProps<{
  imgStyle: StyleValue
}>()
const emits = defineEmits(['droped'])

const imgPath = ref('')

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer === null) return
  const { files } = event.dataTransfer
  if (files.length) {
    const myFiles = []
    for (let i = 0; i < files.length; i++) {
      myFiles.push(new MyFile(files[i]))
    }
    imgPath.value = myFiles[0].path
    emits('droped', imgPath.value)
    console.log('onDrop', myFiles);
  }
}
const onDragover = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
}
</script>

<style scoped>
.img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
