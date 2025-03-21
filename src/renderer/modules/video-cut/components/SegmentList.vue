<template>
  <div class="segment-list ml-4">
    <div class="flex p-10 justify-between items-center select-none">
      <div>
        <span>{{ segmentList.length }}</span>
        <span class="text-gray-500 fs-13 ml-2">个片段</span>
      </div>
      <div>
        <Tooltip>
          <template #title>
            <div class="fs-13">删除所有片段</div>
          </template>
          <Icon name="del" size="16" @click="segmentList.length = 0" />
        </Tooltip>
      </div>
    </div>
    <div class=" flex-1 overflow-auto">
      <div v-for="(segment, index) in segmentList" :key="segment.key" class="p-2">
        <div class="h-1 bg-[var(--divider3)]"></div>
        <div class="border-2 border-transparent hover:border-[var(--theme-color)] px-8 py-8">
          <div class=" relative">
            <img :src="segment.thumbnail" alt="" style="height: 112px;object-fit: cover;" @click="click(segment.start)">
            <div
              class=" absolute right-0 top-0 px-8 py-6 bg-black/80 text-xs cursor-pointer hover:text-[var(--theme-color)]"
              @click="remove(index)">删除
            </div>
          </div>
          <div class="flex justify-between items-center mt-6">
            <TimeInput :ref="(el) => startInputRefs[segment.key] = el" :value="segment.start"
              @change="(time) => setTime(index, time, 'start')" />
            <span>-</span>
            <TimeInput :ref="(el) => endInputRefs[segment.key] = el" :value="segment.end"
              @change="(time) => setTime(index, time, 'end')" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex p-6">
      <Button type="primary" class="w-full" :disabled="segmentList.length === 0" :loading="exportLoading"
        @click="exportVideo">导出</Button>
    </div>
    <Modal v-model:open="show.exportComplete" title="提示" centered>
      <div>导出完成，用时：{{ exportTime }}</div>
      <template #footer>
        <Button type="primary" @click="openOutDir">打开输出目录</Button>
      </template>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import TimeInput from './TimeInput.vue';
import { Button, Modal } from 'ant-design-vue';
import { useVideoStore } from '@/renderer/store'
import { reactive, ref } from 'vue';
import { cutAndMergeVideo, Performance } from '@/renderer/util'
import { message } from 'ant-design-vue';

const call = defineEmits(['remove'])

const { invoke } = window

const store = useVideoStore()
const segmentList = store.segmentList
const projectMeta = store.projectMeta
const show = store.show
const { setCurrentTime } = store.action

const startInputRefs: any = {}
const endInputRefs: any = {}

const exportTime = ref('')

const exportLoading = ref(false)

const setTime = (index: number, time: number, type: string) => {
  const segment = segmentList[index]
  if (type === 'start') {
    if (time >= segment.end) {
      startInputRefs[segment.key].reset()
      return message.error('开始时间不能大于结束时间')
    }
    if (index !== 0 && time <= segmentList[index - 1].end) {
      startInputRefs[segment.key].reset()
      return
    }
    segment.setStart(time)
  } else if (type === 'end') {
    if (time <= segment.start) {
      endInputRefs[segment.key].reset()
      return message.error('结束时间不能小于开始时间')
    }
    if (index !== segmentList.length - 1 && time >= segmentList[index + 1].start) {
      startInputRefs[segment.key].reset()
      return
    }
    segment.setEnd(time)
  }
}

const click = (start: number) => {
  setCurrentTime(start)
}

const remove = (index: number) => {
  call('remove', index)
}

const exportVideo = async () => {
  if (!segmentList.length) return
  Performance.start()
  exportLoading.value = true
  try {
    await cutAndMergeVideo(segmentList)
    exportLoading.value = false
    message.success('导出完成')
    exportTime.value = Performance.end()
    show.exportComplete = true
  } catch (error) {
    console.log(error);
    exportLoading.value = false
    message.err('导出失败')
  }
}
const openOutDir = () => {
  show.exportComplete = false
  invoke('os:openDir', projectMeta.outDir)
}
</script>

<style lang="scss" scoped>
.segment-list {
  flex-basis: 220px;
  background: #464646;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>