<template>
  <div class="h-full flex flex-col overflow-hidden">
    <main class="flex-1 flex overflow-hidden">
      <aside class="border-r border-[var(--divider)] flex flex-col py-10 pl-10">
        <div class="flex text-gray-400 gap-10 pb-10 border-b border-[var(--divider)]">
          <span>图片总数：{{ imgs.length }}</span>
          <span>处理中：{{ processCount }}</span>
          <span>处理完成：<span class=" text-green-600">{{ completeCount }}</span></span>
        </div>
        <div class="flex gap-10 my-10">
          <Button type="primary" :loading="loading" @click="saveAll(SaveType.OVERWRITE)">保存并覆盖</Button>
          <Button type="primary" :loading="loading" @click="saveAll(SaveType.DUPLICATE)">保存为副本</Button>
          <Button type="primary" @click="clearWorkSpace">全部清除</Button>
        </div>
        <div class="grid grid-cols-2 gap-14 overflow-auto pr-10">
          <ImgCard v-for="(img, index) in imgs" :key="img.path" :img="img" :selected="index === selected"
            @click="setPreview(index)" @action="(type) => onAction(index, type)" />
        </div>
      </aside>
      <section class="flex-1 overflow-hidden">
        <ImgCompare v-if="selected !== -1" :before="imgs[selected].path" :after="imgs[selected].compressedImg" />
      </section>
    </main>
    <footer class="text-gray-400 fs-13 h-30 flex items-center justify-between px-10 border-t border-[var(--divider)]">
      <div class="flex items-center">
        <Tooltip>
          <template #title>
            <div class="fs-13">打开缓存目录</div>
          </template>
          <Icon name="openFold" size="16" @click="openTempDir" />
        </Tooltip>
        <span>缓存目录：{{ tempDir }}</span>
      </div>
    </footer>
    <Modal v-model:open="modal.overwrite" title="操作确认" centered @ok="resolve">
      <div>确定要覆盖原文件吗？</div>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import ImgCompare from '@/components/ImgCompare.vue';
import ImgCard from '@/components/ImgCard.vue';
import { emitter } from '@/util'
import C from '@/util/const'
import { useModule, usePromise } from '@/composables'
import { ImgCompress } from '@/util/ImgCompress';
import { SaveType } from '../../common/types'
import { message } from 'ant-design-vue';

const { invoke } = window

const { isModuleActive } = useModule(C.IMG_MODULE)
const { resolve, future } = usePromise()
const imgs = reactive<ImgCompress[]>([])
const selected = ref(-1)
const loading = ref(false)
const modal = reactive({
  overwrite: false,
})
const tempDir = ref('')

const setPreview = (index: number) => {
  if (!imgs[index].compressed) return
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

const saveAll = async (saveType: SaveType) => {
  if (saveType === SaveType.OVERWRITE) {
    await future(() => modal.overwrite = true)
    modal.overwrite = false
    dispatchSave(imgs, saveType)
  } else if (saveType === SaveType.DUPLICATE) {
    dispatchSave(imgs, saveType)
  }
}
const dispatchSave = async (imgs: ImgCompress[], saveType: SaveType) => {
  try {
    const imgList = imgs
      .filter(img => img.compressed)
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

const onAction = async (imgIndex: number, type: string) => {
  switch (type) {
    case 'save':
      await future(() => modal.overwrite = true)
      modal.overwrite = false
      dispatchSave([imgs[imgIndex]], SaveType.OVERWRITE)
      break;
    case 'saveAs':
      break
    case 'remove':
      if (imgs.length === 1) {
        selected.value = -1
      }
      imgs.splice(imgIndex, 1)
      break
  }
}

const openTempDir = () => {
  invoke('os:openDir', tempDir.value)
}

const processCount = computed(() => {
  return imgs.filter(img => !img.compressed).length
})
const completeCount = computed(() => {
  return imgs.filter(img => img.compressed).length
})

watch(imgs, () => {
  if (selected.value === -1) {
    const firstImg = imgs.findIndex(img => img.compressed)
    if (firstImg !== -1) {
      selected.value = firstImg
    }
  }
})

onMounted(async () => {
  emitter.on('USER_DROP_FILE', drop as any)
  tempDir.value = await invoke('compress:tmpdir')
})
onUnmounted(() => {
  emitter.off('USER_DROP_FILE', drop as any)
})
</script>

<style lang="scss" scoped></style>