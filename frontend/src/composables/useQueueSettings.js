import { ref } from 'vue'
import { api } from '@/services/api'

export function useQueueSettings() {
  const settings = ref({})
  const loading = ref(false)
  const error = ref(null)

  const fetchSettings = async (queueId) => {
    loading.value = true
    try {
      const { data } = await api.get(`/queues/${queueId}/settings`)
      settings.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (queueId, settingsData) => {
    loading.value = true
    try {
      const { data } = await api.put(`/queues/${queueId}/settings`, settingsData)
      settings.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWorkHours = async (queueId, workHours) => {
    loading.value = true
    try {
      const { data } = await api.put(`/queues/${queueId}/work-hours`, workHours)
      settings.value.workHours = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateGreetingMessage = async (queueId, message) => {
    loading.value = true
    try {
      const { data } = await api.put(`/queues/${queueId}/greeting`, { message })
      settings.value.greetingMessage = data.message
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateWorkHours,
    updateGreetingMessage
  }
} 