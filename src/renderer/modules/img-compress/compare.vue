<template>
  <div class="h-full flex flex-col overflow-hidden">
    <main class="flex-1 flex overflow-hidden">
      <section class="flex-1 overflow-hidden">
        <div class="h-full p-10 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-hidden">
            <ScaleCompareWithDrop />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
<script setup lang="ts">
import ScaleCompareWithDrop from './components/ScaleCompareWithDrop.vue';
</script>

<style lang="scss" scoped></style>