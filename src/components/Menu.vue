
<template>
  <div>
    <Menu v-model:selectedKeys="state.selectedKeys" mode="horizontal" theme="dark" :items="items" @click="onClick"></Menu>
  </div>
</template>
<script setup lang="ts">
import { reactive, h } from 'vue'
import {
  PieChartOutlined,
  DesktopOutlined,
} from '@ant-design/icons-vue';
import { Menu } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const state = reactive({
  selectedKeys: ['/video'],
});
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
const onClick = ({ key }: any) => {
  router.push(key)
}
</script>
    
<style lang="scss" scoped></style>