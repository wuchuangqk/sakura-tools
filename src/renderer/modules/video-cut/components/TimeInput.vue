<template>
  <input v-model="time" type="text" class="time-input" :disabled="disabled" @change="onChange">
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { fmtDuration, reverseToSecond } from '@/renderer/util'

const props = withDefaults(defineProps<{
  value?: number,
  disabled?: boolean,
}>(), {
  value: 0,
  disabled: false,
})

const call = defineEmits(['change'])

let valueFmt = ''
const time = ref()

const isValid = (time: string) => /^\d{2}:\d{2}:\d{2}:\d{2}$/.test(time);
const onChange = () => {
  if (!isValid(time.value)) {
    time.value = valueFmt
  } else {
    call('change', reverseToSecond(time.value))
  }
}

const reset = () => {
  time.value = valueFmt
}

watch(() => props.value, (newVal) => {
  valueFmt = fmtDuration(newVal)
  time.value = valueFmt
}, { immediate: true })

defineExpose({
  reset
})
</script>

<style lang="scss" scoped>
.time-input {
  background: #323232;
  width: 90px;
  text-align: center;
  padding: 4px 0;
  font-size: 13px;
  outline: none;
}
</style>