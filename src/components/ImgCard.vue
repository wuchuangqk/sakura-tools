<template>
  <Spin :spinning="!img.loading" :indicator="indicator" tip="正在压缩">
    <div class="w-[180px] bg-[#313131] rounded-md img-card overflow-hidden border border-[var(--divider)] relative"
      :class="{ selected }" @click="call('click')">
      <div class="h-[150px]">
        <img :src="img.path" alt="" class="w-full h-full object-cover">
      </div>
      <div class="flex justify-between items-baseline text-gray-300 mt-10 px-10">
        <span :class="[diff.better ? 'text-green-600' : 'text-red-600', 'text-lg']">{{ diff.percent }}</span>
        <span class="fs-13">
          <span>{{ compressedSize }}</span>
          <span class=" text-gray-400">/{{ originSize }}</span>
        </span>
      </div>
      <div v-if="img.extension === 'jpg'" class="flex fs-13 items-center gap-10 text-gray-400 px-10">
        <span>质量</span>
        <Slider v-model:value="img.quality" :min="10" :max="90" class="flex-1" @afterChange="changeQuality" />
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
      <div v-if="selected" class="status">预览中</div>
    </div>
  </Spin>
</template>
<script setup lang="ts">
import { ref, h, onMounted, computed } from 'vue'
import { LoadingOutlined } from '@ant-design/icons-vue';
import { fmtFileSize } from '@/util'
import { ImgCompress } from '@/util/ImgCompress';

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

const changeQuality = () => {
  props.img.compress()
}

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
  background-color: #626dff;
  font-size: 12px;
}
</style>