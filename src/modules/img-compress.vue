<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex-1 overflow-hidden">
      <ImgCompare v-if="selected !== -1" :before="imgs[selected].path" :after="imgs[selected].compressedImg" />
    </div>
    <div class="h-[250px] flex flex-wrap gap-20 p-20 overflow-auto">
      <ImgCard v-for="(img, index) in imgs" :key="img.path" :img="img" :selected="index === selected"
        @click="setPreview(index)" />
    </div>
    <div class="flex gap-10">
      <Button type="primary">全部保存</Button>
      <Button type="primary" @click="clearWorkSpace">全部清除</Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import ImgCompare from '@/components/ImgCompare.vue';
import ImgCard from '@/components/ImgCard.vue';
import { emitter } from '@/util'
import C from '@/util/const'
import { useModule } from '@/composables'
import { ImgCompress } from '@/util/ImgCompress';

const { invoke } = window

const { isModuleActive } = useModule(C.IMG_MODULE)
const imgs = reactive<ImgCompress[]>([])
const selected = ref(-1)
const setPreview = (index: number) => {
  if (imgs[index].loading) return
  selected.value = index
}
// 拖拽上传
const drop = (files: FileList) => {
  console.log('isModuleActive', isModuleActive.value, C.IMG_MODULE);
  if (!isModuleActive.value) return
  for (let i = 0; i < files.length; i++) {
    // @ts-ignore
    const img = new ImgCompress(files[i].path)
    imgs.push(img)
  }
}

const clearWorkSpace = () => {
  selected.value = -1
  imgs.length = 0
  invoke('compress:clearTempDir')
}

onMounted(() => {
  emitter.on('USER_DROP_FILE', drop as any)
})
onUnmounted(() => {
  emitter.off('USER_DROP_FILE', drop as any)
})
</script>

<style lang="scss" scoped></style>