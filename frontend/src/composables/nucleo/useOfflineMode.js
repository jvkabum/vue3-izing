import { ref, onMounted, onUnmounted } from 'vue'
import { useNotification } from '@/composables/useNotification'

export function useOffline() {
  const isOffline = ref(!navigator.onLine)
  const { notify } = useNotification()

  const handleOnline = () => {
    isOffline.value = false
    notify({
      type: 'positive',
      message: 'Conexão restaurada',
      position: 'top'
    })
  }

  const handleOffline = () => {
    isOffline.value = true
    notify({
      type: 'warning',
      message: 'Você está offline',
      position: 'top'
    })
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOffline
  }
} 