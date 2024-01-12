import { createRouter, createMemoryHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/video'
  },
  {
    path: '/video',
    component: () => import('@/modules/video-cut.vue')
  },
  {
    path: '/img',
    component: () => import('@/modules/img-compress.vue')
  }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
  // 是否应该禁止尾部斜杠。默认为假
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});