import { ref, computed } from 'vue'

export function useLoadingState() {
  const loadingStates = ref(new Map())
  const globalLoading = ref(false)

  const isLoading = computed(() => 
    globalLoading.value || Array.from(loadingStates.value.values()).some(state => state)
  )

  const startLoading = (key = 'global') => {
    if (key === 'global') {
      globalLoading.value = true
    } else {
      loadingStates.value.set(key, true)
    }
  }

  const stopLoading = (key = 'global') => {
    if (key === 'global') {
      globalLoading.value = false
    } else {
      loadingStates.value.set(key, false)
    }
  }

  const withLoading = async (key, fn) => {
    startLoading(key)
    try {
      return await fn()
    } finally {
      stopLoading(key)
    }
  }

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  }
} 