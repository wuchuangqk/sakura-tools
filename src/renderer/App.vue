<template>
  <ConfigProvider :theme="theme" :locale="zhCN">
    <div class="h-full flex flex-col overflow-hidden">
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
import Menu from '@/renderer/components/Menu.vue'
import Logo from '@/renderer/components/Logo.vue'
import { useDrop } from '@/renderer/composables'
import { appStore } from '@/renderer/store'
import { onMounted } from 'vue'

const theme = {
  token: {
    borderRadius: 2,
    wireframe: true,
  }
}
// useDrop()
onMounted(() => {
  document.body.classList.toggle(appStore.theme)
})
</script>
<style scoped lang="scss"></style>