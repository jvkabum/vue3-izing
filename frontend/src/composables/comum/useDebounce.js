import { ref } from 'vue'

export function useDebounce() {
  const timeoutId = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const debounce = (fn, delay = 300) => {
    return (...args) => {
      loading.value = true
      
      if (timeoutId.value) {
        clearTimeout(timeoutId.value)
      }

      return new Promise((resolve, reject) => {
        timeoutId.value = setTimeout(async () => {
          try {
            const result = await fn(...args)
            resolve(result)
          } catch (err) {
            error.value = err.message
            reject(err)
          } finally {
            loading.value = false
          }
        }, delay)
      })
    }
  }

  const cancel = () => {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
      loading.value = false
    }
  }

  return {
    loading,
    error,
    debounce,
    cancel
  }
} 