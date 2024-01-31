<template>
  <Spin :spinning="img.compressing" :indicator="indicator" tip="正在压缩">
    <div class=" bg-[#313131] rounded-md img-card overflow-hidden border border-[var(--divider)] relative"
      :class="{ selected }" @click="call('click')">
      <div class="h-[140px] relative">
        <img :src="img.path" alt="" class="w-full h-full object-cover">
        <div
          class="flex justify-between items-end absolute bottom-0 left-0 right-0 h-40 px-10 pb-6 img-meta fs-12 text-gray-300">
          <div>{{ img.extension.toUpperCase() }}</div>
          <Flex class="fs-12" align="flex-end" gap="4">
            <Icon name="time" size="14" :border="false" /><span>{{ img.compressed ? img.compresTime : '--' }}秒</span>
          </Flex>
        </div>
      </div>
      <div class="flex justify-between items-baseline text-gray-300 my-10 px-10">
        <!-- 压缩比 -->
        <span :class="[diff.better ? 'text-green-600' : 'text-red-600', 'text-lg']">{{ img.compressed ? diff.percent :
          '--' }}</span>
        <span class="fs-13">
          <span>{{ img.compressed ? compressedSize : '--' }}</span>
          <span class=" text-gray-400">/{{ originSize }}</span>
        </span>
      </div>
      <div class="flex border-t border-[var(--divider2)] h-32">
        <div class="flex-1 flex items-center justify-center">
          <Tooltip>
            <template #title>
              <div class="fs-13">保存并覆盖</div>
            </template>
            <Icon name="save" size="16" @click="save" />
          </Tooltip>
        </div>
        <div class="flex-1 flex items-center justify-center border-x border-[var(--divider2)]">
          <Tooltip>
            <template #title>
              <div class="fs-13">另存为</div>
            </template>
            <Icon name="saveAs" size="16" @click="saveAs" />
          </Tooltip>
        </div>
        <div class="flex-1 flex items-center justify-center">
          <Tooltip>
            <template #title>
              <div class="fs-13">移除</div>
            </template>
            <Icon name="del" size="16" @click="remove" />
          </Tooltip>
        </div>
      </div>
      <!-- 标签 -->
      <div v-if="selected" class="status preview">预览中</div>
      <div v-if="img.error" class="status error">压缩失败</div>
    </div>
  </Spin>
</template>
<script setup lang="ts">
import { ref, h, onMounted, computed } from 'vue'
import { LoadingOutlined } from '@ant-design/icons-vue';
import { fmtFileSize } from '@/renderer/util'
import { ImgCompress } from '@/renderer/util/ImgCompress';

const props = defineProps<{
  img: ImgCompress,
  selected: boolean
}>()

const call = defineEmits(['click', 'action'])

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '24px',
  },
  spin: true,
});

const originSize = computed(() => {
  return fmtFileSize(props.img.originSize)
})
const compressedSize = computed(() => {
  return fmtFileSize(props.img.compressedSize)
})
const diff = computed(() => {
  const originSize = props.img.originSize
  const compressedSize = props.img.compressedSize
  const size = originSize - compressedSize
  let percent = 0
  if (originSize !== 0) {
    percent = Math.round(Math.abs(size) / originSize * 100)
  }
  return {
    better: size >= 0,
    percent: size >= 0 ? `-${percent}%` : `+${percent}%`
  }
})

const save = () => {
  call('action', 'save')
}
const saveAs = () => {
  call('action', 'saveAs')
}
const remove = () => {
  call('action', 'remove')
}

onMounted(() => {
  props.img.setSize()
  props.img.compress()
})
</script>

<style lang="scss" scoped>
.selected {
  border-color: #626dff;
}

.img-card {
  &:hover {
    box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
  }
}

.status {
  position: absolute;
  top: 6px;
  left: 6px;
  border-radius: 4px;
  padding: 4px 8px;
  color: #fff;
  font-size: 12px;

  &.preview {
    background-color: #626dff;
  }

  &.error {
    background-color: #d91010;
  }
}

.img-meta {
  background: linear-gradient(to top, rgb(0 0 0 / 70%), rgb(0 0 0 / 0%));
}
</style>