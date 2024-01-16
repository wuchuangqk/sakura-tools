<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex-1 overflow-hidden">
      <ImgCompare v-if="selected !== -1" :before="imgs[selected].path" :after="imgs[selected].compressedImg" />
    </div>
    <div class="bg-[#282828]">
      <div class="flex gap-10">
        <Button type="primary" :loading="loading" @click="saveAll(SaveType.OVERWRITE)">保存并覆盖</Button>
        <Button type="primary" :loading="loading" @click="saveAll(SaveType.DUPLICATE)">保存为副本</Button>
        <Button type="primary" @click="clearWorkSpace">全部清除</Button>
      </div>
      <div class="h-[250px] flex flex-wrap gap-20 p-20 overflow-auto">
        <ImgCard v-for="(img, index) in imgs" :key="img.path" :img="img" :selected="index === selected"
          @click="setPreview(index)" @action="(type) => onAction(index, type)" />
      </div>
    </div>
    <Modal v-model:open="modal.overwrite" title="操作确认" centered @ok="saveAll(SaveType.OVERWRITE)">
      <div>确定要覆盖原文件吗？</div>
    </Modal>
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
import { SaveType } from '../../common/types'
import { message } from 'ant-design-vue';

const { invoke } = window

const { isModuleActive } = useModule(C.IMG_MODULE)
const imgs = reactive<ImgCompress[]>([])
const selected = ref(-1)
const loading = ref(false)
const modal = reactive({
  overwrite: false,
})

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

const saveAll = (saveType: SaveType) => {
  if (saveType === SaveType.OVERWRITE) {
    if (modal.overwrite) {
      modal.overwrite = false
      dispatchSave(imgs, saveType)
    } else {
      modal.overwrite = true
    }
  } else if (saveType === SaveType.DUPLICATE) {
    dispatchSave(imgs, saveType)
  }
}
const dispatchSave = async (imgs: ImgCompress[], saveType: SaveType) => {
  try {
    const imgList = imgs
      .filter(img => !img.loading)
      .map(img => ({
        originPath: img.path,
        compressedPath: img.compressedImg,
        ext: img.extension
      }))
    if (imgList.length === 0) return
    loading.value = true
    await invoke('compress:save', { imgList, saveType })
    loading.value = false
    message.success('保存成功')
  } catch (error) {
    console.log(error);
    loading.value = false
    message.error('保存失败')
  }
}

const onAction = (imgIndex: number, type: string) => {

}

onMounted(() => {
  emitter.on('USER_DROP_FILE', drop as any)
})
onUnmounted(() => {
  emitter.off('USER_DROP_FILE', drop as any)
})
</script>

<style lang="scss" scoped></style>