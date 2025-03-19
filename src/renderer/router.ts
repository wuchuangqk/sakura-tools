import { createRouter, createMemoryHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/compare'
  },
  {
    path: '/video',
    name: 'video',
    component: () => import('@/renderer/modules/video-cut/index.vue')
  },
  {
    path: '/img',
    name: 'img',
    component: () => import('@/renderer/modules/img-compress/index.vue')
  },
  {
    path: '/compare',
    name: 'img-compare',
    component: () => import('@/renderer/modules/img-compress/compare.vue')
  }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
  // 是否应该禁止尾部斜杠。默认为false
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});