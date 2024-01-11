<template>
  <div>
    <div class="h-1 bg-[#818181]"></div>
    <div class="flex h-6 relative">
      <svg v-for="line in scaleLines" :key="line.left" width="1" height="6" class=" absolute"
        :style="{ left: line.left }">
        <line x1="0" y1="0" x2="0" y2="6" style="stroke-width:1;stroke: #818181;" />
      </svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useStore } from '@/util/store'
import { computed } from 'vue';
import Decimal from 'decimal.js'
import { getAvgNums } from '@/util'

const store = useStore()
const videoMeta = store.videoMeta

const scaleLines = computed(() => {
  // 长的视频关键帧可能有几千个，时间线放不下，所以要限制展示的关键帧数量
  const keyFrames = getAvgNums(store.keyFrames, 129)
  return keyFrames.map((frame: number) => {
    return ({ left: Decimal.div(frame, videoMeta.duration).mul(100) + '%' })
  })
})
</script>

<style lang="scss" scoped></style>