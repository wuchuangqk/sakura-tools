<template>
  <div class="segment-list">
    <span v-show="false">{{ segmentList }}</span>
    <div>
      <div v-for="(segment, index) in segmentList" :key="segment.key"
        class="px-10 py-10 border-b border-[#555555] last-of-type:border-b-0">
        <div class=" relative">
          <img :src="segment.thumbnail" alt="" style="height: 112px;object-fit: cover;" @click="click(segment.start)">
          <div class=" absolute right-0 top-0 px-4 py-2 bg-white/50 text-xs cursor-pointer" @click="remove(index)">删除
          </div>
        </div>
        <div class="flex justify-between items-center mt-6">
          <TimeInput :ref="(el) => setStartInputRef(el, segment.key)" :value="segment.start"
            @change="(time) => setTime(index, time, 'start')" />
          <span>-</span>
          <TimeInput :ref="(el) => setEndInputRef(el, segment.key)" :value="segment.end"
            @change="(time) => setTime(index, time, 'end')" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Segment } from '@/util/Segment';
import TimeInput from './TimeInput.vue';
import { computed, inject, ref } from 'vue';
import { message } from 'ant-design-vue';

const props = defineProps<{
  segmentList: Segment[],
}>()

const call = defineEmits(['remove'])

const { setCurrentTime } = inject('APP') as {
  setCurrentTime: (currentTime: number) => void,
}

const startInputRefs: any = {}
const endInputRefs: any = {}

const setStartInputRef = (el: any, key: symbol) => {
  startInputRefs[key] = el
}
const setEndInputRef = (el: any, key: symbol) => {
  endInputRefs[key] = el
}

const setTime = (index: number, time: number, type: string) => {
  const segment = props.segmentList[index]
  if (type === 'start') {
    if (time >= segment.end) {
      startInputRefs[segment.key].reset()
      return message.error('开始时间不能大于结束时间')
    }
    segment.setStart(time)
  } else if (type === 'end') {
    if (time <= segment.start) {
      endInputRefs[segment.key].reset()
      return message.error('结束时间不能小于开始时间')
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

</script>

<style lang="scss" scoped>
.segment-list {
  flex-basis: 220px;
  background: #464646;
}
</style>