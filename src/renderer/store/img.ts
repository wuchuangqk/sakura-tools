import { defineStore } from "pinia";
import { reactive, ref } from "vue";

const { invoke } = window

export const useImgStore = defineStore('img', () => {
  const meta = reactive({
    tempImgCount: 0,
  })

  return {
    meta,
  }
})