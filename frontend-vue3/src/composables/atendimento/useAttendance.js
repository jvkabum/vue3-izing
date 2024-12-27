import { ref, computed } from 'vue'
import request from 'src/service/request'

export function useAttendance() {
  const attendance = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isActive = computed(() => attendance.value?.status === 'active')
  const isPaused = computed(() => attendance.value?.status === 'paused')

  const startAttendance = async () => {
    loading.value = true
    try {
      const { data } = await request({
        url: '/attendance/start',
        method: 'post'
      })
      attendance.value = data
      return data
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const pauseAttendance = async (reason) => {
    loading.value = true
    try {
      const { data } = await request({
        url: '/attendance/pause',
        method: 'post',
        data: { reason }
      })
      attendance.value = data
      return data
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const resumeAttendance = async () => {
    loading.value = true
    try {
      const { data } = await request({
        url: '/attendance/resume',
        method: 'post'
      })
      attendance.value = data
      return data
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const endAttendance = async () => {
    loading.value = true
    try {
      await request({
        url: '/attendance/end',
        method: 'post'
      })
      attendance.value = null
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAttendanceStatus = async () => {
    loading.value = true
    try {
      const { data } = await request({
        url: '/attendance/status',
        method: 'get'
      })
      attendance.value = data
      return data
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    attendance,
    loading,
    error,
    
    // Computed
    isActive,
    isPaused,
    
    // Métodos
    startAttendance,
    pauseAttendance,
    resumeAttendance,
    endAttendance,
    getAttendanceStatus
  }
}
