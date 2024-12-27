import { ref, computed } from 'vue'
import { api } from '@/services/api'
import { useSocket } from './useSocket'

export function useUserStatus() {
  const { socket } = useSocket()
  const status = ref('offline')
  const lastActivity = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isOnline = computed(() => status.value === 'online')
  const isAway = computed(() => status.value === 'away')
  const isOffline = computed(() => status.value === 'offline')

  const updateStatus = async (newStatus) => {
    loading.value = true
    try {
      const { data } = await api.put('/users/status', { status: newStatus })
      status.value = data.status
      lastActivity.value = data.lastActivity
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateActivity = async () => {
    try {
      const { data } = await api.put('/users/activity')
      lastActivity.value = data.lastActivity
    } catch (err) {
      error.value = err.message
    }
  }

  // Socket listeners
  socket.value?.on('user:status', (data) => {
    status.value = data.status
    lastActivity.value = data.lastActivity
  })

  return {
    status,
    lastActivity,
    loading,
    error,
    isOnline,
    isAway,
    isOffline,
    updateStatus,
    updateActivity
  }
} 