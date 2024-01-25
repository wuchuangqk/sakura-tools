
<template>
  <Menu v-model:selectedKeys="selectedKeys" :mode="mode" theme="dark" :items="items" @click="onClick"></Menu>
</template>
<script setup lang="ts">
import { reactive, h, watch } from 'vue'
import {
  PieChartOutlined,
  DesktopOutlined,
} from '@ant-design/icons-vue';
import { Menu } from 'ant-design-vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const selectedKeys = reactive(['/video'])
const items = reactive([
  {
    key: '/video',
    icon: () => h(PieChartOutlined),
    label: '视频剪辑',
  },
  {
    key: '/img',
    icon: () => h(DesktopOutlined),
    label: '图片压缩',
  },
]);
const mode = 'horizontal' // vertical=垂直，horizontal=水平
const onClick = ({ key }: any) => {
  router.push(key)
}
watch(() => route.path, () => {
  selectedKeys[0] = route.path
})
</script>
    
<style lang="scss" scoped></style>