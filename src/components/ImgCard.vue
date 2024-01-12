<template>
  <Spin :spinning="img.loading" :indicator="indicator">
    <div class="w-[150px] bg-[#313131]" :class="{ selected }" @click="call('click')">
      <div class="h-[150px]">
        <img :src="img.path" alt="" class="w-full h-full object-cover">
      </div>
      <div class="flex justify-between text-gray-300">
        <span>{{ diff }}</span>
        <span>
          <span>{{ compressedSize }}</span>
          <span>/{{ originSize }}</span>
        </span>
      </div>
      <div class="flex gap-20">
        <span>保存</span>
        <span>另存为</span>
      </div>
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

const call = defineEmits(['click'])

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
  const percent = Math.round(Math.abs(size) / originSize * 100)
  return size >= 0 ? `-${percent}%` : `+${percent}%`
})

onMounted(() => {
  props.img.setSize()
  props.img.compress()
})
</script>

<style lang="scss" scoped>
.selected {
  border: 1px solid red;
}
</style>