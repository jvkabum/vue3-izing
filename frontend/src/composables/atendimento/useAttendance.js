import { ref, computed } from 'vue'
import { api } from '@/services/api'

export function useAttendance() {
  const attendance = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isActive = computed(() => attendance.value?.status === 'active')
  const isPaused = computed(() => attendance.value?.status === 'paused')

  const startAttendance = async () => {
    loading.value = true
    try {
      const { data } = await api.post('/attendance/start')
      attendance.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const pauseAttendance = async (reason) => {
    loading.value = true
    try {
      const { data } = await api.post('/attendance/pause', { reason })
      attendance.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const resumeAttendance = async () => {
    loading.value = true
    try {
      const { data } = await api.post('/attendance/resume')
      attendance.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const endAttendance = async () => {
    loading.value = true
    try {
      await api.post('/attendance/end')
      attendance.value = null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    attendance,
    loading,
    error,
    isActive,
    isPaused,
    startAttendance,
    pauseAttendance,
    resumeAttendance,
    endAttendance
  }
} 