import { ref } from 'vue'
import { api } from '@/services/api'

export function useIntegrationLogs() {
  const logs = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchLogs = async (params = {}) => {
    loading.value = true
    try {
      const { data } = await api.get('/integration-logs', { params })
      logs.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchLogsByType = async (type, params = {}) => {
    loading.value = true
    try {
      const { data } = await api.get(`/integration-logs/${type}`, { params })
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearLogs = async (type = null) => {
    loading.value = true
    try {
      const endpoint = type ? `/integration-logs/${type}/clear` : '/integration-logs/clear'
      await api.post(endpoint)
      logs.value = []
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    logs,
    loading,
    error,
    fetchLogs,
    fetchLogsByType,
    clearLogs
  }
} 