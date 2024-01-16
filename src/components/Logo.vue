<template>
  <div class="h-50">
    <img :src="logo" alt="" class="h-full w-full object-cover rounded-full">
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import logo from '@/assets/app.ico'
</script>

<style lang="scss" scoped></style>