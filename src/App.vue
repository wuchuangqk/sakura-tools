<template>
  <ConfigProvider :theme="theme" :locale="zhCN">
    <div class="h-full flex overflow-hidden">
      <div class="flex flex-col overflow-hidden">
        <!-- <Logo /> -->
        <Menu class="flex-1"></Menu>
      </div>
      <div class="main flex-1 overflow-hidden">
        <RouterView #default="{ Component, route }">
          <keep-alive>
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </RouterView>
      </div>
    </div>
  </ConfigProvider>
</template>
<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import Menu from '@/components/Menu.vue'
import Logo from '@/components/Logo.vue'
import { useDrop } from '@/composables'

const theme = {
  token: {
    borderRadius: 2,
    wireframe: true,
  }
}
useDrop()
</script>
<style scoped lang="scss"></style>
