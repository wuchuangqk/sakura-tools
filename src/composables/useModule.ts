import { computed } from "vue"
import { useRoute } from "vue-router"

export const useModule = (moduleName: string) => {
  const route = useRoute()
  const isModuleActive = computed(() => route.name === moduleName)

  return {
    isModuleActive,
  }
}