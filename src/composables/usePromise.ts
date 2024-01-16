import { ref } from "vue"

export const usePromise = () => {
  const resolve = ref()
  const reject = ref()
  const future = (fn: Function) => {
    return new Promise((_resolve, _reject) => {
      fn()
      resolve.value = _resolve
      reject.value = _reject
    })
  }
  return {
    resolve,
    reject,
    future
  }
}