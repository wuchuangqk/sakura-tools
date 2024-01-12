<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex-1 overflow-hidden">
      <ImgCompare before="https://cdn.pixabay.com/photo/2023/09/20/19/47/birds-8265503_1280.jpg"
        after="https://cdn.pixabay.com/photo/2023/09/20/19/47/birds-8265503_1280.jpg" />
    </div>
    <div class="h-[200px] flex flex-wrap gap-20 p-10">
      <ImgCard v-for="(img, index) in imgs" :key="index" :img="img" :selected="index === selected"
        @click="selected = index" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import ImgCompare from '@/components/ImgCompare.vue';
import ImgCard from '@/components/ImgCard.vue';

const imgs = reactive<IImg[]>([
  {
    path: 'https://cdn.pixabay.com/photo/2023/09/20/19/47/birds-8265503_1280.jpg',
    compressedImg: '',
    originSize: 0,
    compressedSize: 0,
    loading: false,
  },
  {
    path: 'https://cdn.pixabay.com/photo/2023/09/20/19/47/birds-8265503_1280.jpg',
    compressedImg: '',
    originSize: 0,
    compressedSize: 0,
    loading: false,
  },
  {
    path: 'https://cdn.pixabay.com/photo/2023/09/20/19/47/birds-8265503_1280.jpg',
    compressedImg: '',
    originSize: 0,
    compressedSize: 0,
    loading: false,
  },
])
const selected = ref(0)
</script>

<style lang="scss" scoped></style>