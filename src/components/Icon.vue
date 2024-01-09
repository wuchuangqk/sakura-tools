<template>
  <div class="icon-wrap">
    <svg aria-hidden="true" class="svg-icon" :style="style">
      <use :xlink:href="iconName" />
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  name: string, // 图标名称
  size?: string | number,
  color?: string,
}>(), {
  size: 16,
  color: 'var(--color)',
})

const iconName = computed(() => `#icon-${props.name}`)
const style = computed(() => ({ width: props.size + 'px', height: props.size + 'px', color: props.color }))
</script>

<style scope lang="scss">
.svg-icon {
  width: 1em;
  height: 1em;
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
}

.icon-wrap {
  padding: 4px 6px;
  border-radius: 4px;

  &:hover {
    background-color: #454646;
  }
}
</style>
