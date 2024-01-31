<template>
  <div class="h-full flex flex-col overflow-hidden">
    <main class="flex-1 flex overflow-hidden">
      <aside v-if="imgs.length" class="border-r border-[var(--divider)] flex flex-col w-[360px]">
        <header class="flex justify-between items-center text-gray-400 gap-10 p-10 border-b border-[var(--divider)]">
          <div><span class=" text-green-600">{{ completeCount }}</span>/{{ imgs.length }}</div>
          <Flex gap="10">
            <Tooltip>
              <template #title>
                <div class="fs-13">添加图片</div>
              </template>
              <Icon name="openFold" size="16" @click="open" />
            </Tooltip>
            <Tooltip>
              <template #title>
                <div class="fs-13">全部保存并覆盖</div>
              </template>
              <Icon name="save" size="16" @click="saveAll(SaveType.OVERWRITE)" />
            </Tooltip>
            <Tooltip>
              <template #title>
                <div class="fs-13">全部保存为副本</div>
              </template>
              <Icon name="saveAs" size="16" @click="saveAll(SaveType.DUPLICATE)" />
            </Tooltip>
            <Tooltip>
              <template #title>
                <div class="fs-13">全部清除</div>
              </template>
              <Icon name="del" size="16" @click="clearWorkSpace" />
            </Tooltip>
          </Flex>
        </header>
        <div class="flex justify-center py-6 fs-12 text-gray-500">拖拽图片到这里继续添加</div>
        <div class="grid grid-cols-2 gap-14 overflow-auto px-10">
          <ImgCard v-for="(img, index) in imgs" :key="img.path" :img="img" :selected="index === selected"
            @click="setPreview(index)" @action="(type) => onAction(index, type)" />
        </div>
      </aside>
      <section class="flex-1 overflow-hidden">
        <StartPage v-if="imgs.length === 0" @load="drop" />
        <div class="h-full p-10">
          <ImgCompare v-if="selected !== -1" :before="imgs[selected].path" :after="imgs[selected].compressedImg" />
        </div>
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
      <Flex gap="10">
        <span>{{ appMeta.name }}</span>
        <span>{{ appMeta.version }}</span>
      </Flex>
    </footer>
    <Modal v-model:open="modal.overwrite" title="操作确认" centered @ok="resolve">
      <div>确定要覆盖原文件吗？</div>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import ImgCompare from './components/ImgCompare.vue';
import ImgCard from './components/ImgCard.vue';
import StartPage from './components/StartPage.vue';
import { emitter, C, ImgCompress, getFileExtension } from '@/renderer/util'
import { useModule, usePromise } from '@/renderer/composables'
import { SaveType } from '../../../common/types'
import { message } from 'ant-design-vue';
import { useVideoStore } from '@/renderer/store'
import { useFileDialog } from '@vueuse/core'

const { invoke } = window

const store = useVideoStore()
store.init()
const appMeta = store.appMeta

const { isModuleActive } = useModule(C.IMG_MODULE)
const { resolve, future } = usePromise()
const { open, onChange } = useFileDialog({
  multiple: true,
  accept: 'image/*',
  directory: false,
})

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
  // console.log('isModuleActive', isModuleActive.value, C.IMG_MODULE);
  if (!isModuleActive.value) return
  let extisNotSupport = false
  for (let i = 0; i < files.length; i++) {
    const { name, path } = files[i]
    if (!isSupport(name)) {
      extisNotSupport = true
      continue
    }
    const img = new ImgCompress(path)
    imgs.push(img)
  }
  if (extisNotSupport) {
    message.error('仅支持jpg、png、webp格式的图片')
  }
}
const isSupport = (name: string) => {
  return ['jpg', 'png', 'webp'].includes(getFileExtension(name))
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

const completeCount = computed(() => {
  return imgs.filter(img => img.compressed).length
})

onChange((files) => {
  if (files === null || files.length === 0) return
  drop(files)
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