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
          <ImgCard v-for="(img, index) in imgs" :key="img.file.path" :img="img" :selected="index === selected"
            @click="setPreview(index)" @action="(type) => onAction(index, type)" />
        </div>
      </aside>
      <section class="flex-1 overflow-hidden">
        <StartPage v-if="imgs.length === 0" @load="drop" />
        <div class="h-full p-10 flex flex-col overflow-hidden">
          <RadioGroup v-model:value="compareMode">
            <RadioButton value="ScaleCompare">ScaleCompare</RadioButton>
            <RadioButton value="SliderCompare">SliderCompare</RadioButton>
          </RadioGroup>
          <div class="flex-1 overflow-hidden">
            <ScaleCompare v-if="selected !== -1 && compareMode === 'ScaleCompare'" :compress-info="imgs[selected]" />
            <SliderCompare v-if="selected !== -1 && compareMode === 'SliderCompare'" :compress-info="imgs[selected]" />
          </div>

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
        <div class=" ml-10">缓存图片：{{ meta.tempImgCount }}</div>
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
import SliderCompare from './components/SliderCompare.vue';
import ScaleCompare from './components/ScaleCompare.vue';
import ImgCard from './components/ImgCard.vue';
import StartPage from './components/StartPage.vue';
import { emitter, C, ImgCompress, getFileExtension, MyFile } from '@/renderer/util'
import { useModule, usePromise } from '@/renderer/composables'
import { SaveType } from '../../../common/types'
import { message } from 'ant-design-vue';
import { useVideoStore, useImgStore } from '@/renderer/store'
import { useFileDialog } from '@vueuse/core'
import { storeToRefs } from 'pinia'

const { invoke } = window

const store = useVideoStore()
const imgStore = useImgStore()
const { meta } = storeToRefs(imgStore)
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
const compareMode = ref('ScaleCompare')

const setPreview = (index: number) => {
  if (!imgs[index].compressed) return
  selected.value = index
}
// 拖拽上传
const drop = (files: MyFile[]) => {
  if (!isModuleActive.value) return
  for (let i = 0; i < files.length; i++) {
    console.log('拖拽添加图片', files[i].name, files[i].path);
    if (!isSupport(files[i].ext)) {
      message.error('仅支持jpg格式的图片')
      continue
    }
    if (imgs.findIndex(img => img.file.path === files[i].path) !== -1) {
      message.error('不能添加相同的图片')
      continue
    }
    const img = new ImgCompress(files[i])
    imgs.push(img)
  }
}
const isSupport = (ext: string) => {
  return ['jpg'].includes(ext)
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
        originPath: img.file.path,
        compressedPath: img.compressedImgPath,
        ext: img.file.ext
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
  const { file, compressedImgPath } = imgs[imgIndex]
  switch (type) {
    case 'save':
      await future(() => modal.overwrite = true)
      modal.overwrite = false
      dispatchSave([imgs[imgIndex]], SaveType.OVERWRITE)
      break;
    case 'saveAs':
      await invoke('compress:save', {
        imgList: [{
          compressedPath: compressedImgPath,
          originPath: file.path,
          name: file.name,
          dir: file.dir,
          ext: file.ext,
        }], saveType: SaveType.SAVE_AS
      })
      message.success('另存为成功')
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
  const myFiles = []
  for (let i = 0; i < files.length; i++) {
    myFiles.push(new MyFile(files[i]))
  }
  drop(myFiles)
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