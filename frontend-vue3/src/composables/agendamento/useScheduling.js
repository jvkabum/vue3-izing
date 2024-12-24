import { ref } from 'vue'
import { api } from '@/services/api'

export function useSchedule() {
  const schedules = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchSchedules = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/schedules')
      schedules.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createSchedule = async (schedule) => {
    loading.value = true
    try {
      const { data } = await api.post('/schedules', schedule)
      schedules.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSchedule = async (id, schedule) => {
    loading.value = true
    try {
      const { data } = await api.put(`/schedules/${id}`, schedule)
      const index = schedules.value.findIndex(s => s.id === id)
      if (index !== -1) {
        schedules.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSchedule = async (id) => {
    loading.value = true
    try {
      await api.delete(`/schedules/${id}`)
      schedules.value = schedules.value.filter(s => s.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
  }
} 