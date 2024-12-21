import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'

export function useSession() {
  const router = useRouter()
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isActive = computed(() => !!session.value)
  const lastActivity = computed(() => session.value?.lastActivity)

  const startSession = async () => {
    loading.value = true
    try {
      const { data } = await api.post('/sessions/start')
      session.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const endSession = async () => {
    if (!session.value) return

    loading.value = true
    try {
      await api.post('/sessions/end')
      session.value = null
      router.push('/login')
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateActivity = async () => {
    if (!session.value) return

    try {
      const { data } = await api.put('/sessions/activity')
      session.value = data
    } catch (err) {
      error.value = err.message
    }
  }

  return {
    session,
    loading,
    error,
    isActive,
    lastActivity,
    startSession,
    endSession,
    updateActivity
  }
} 