import { ref } from 'vue'
import { api } from '@/services/api'

export function useDashboard() {
  const metrics = ref({
    tickets: {
      total: 0,
      pending: 0,
      open: 0,
      closed: 0
    },
    messages: {
      sent: 0,
      received: 0,
      total: 0
    },
    users: {
      total: 0,
      online: 0
    }
  })
  const loading = ref(false)
  const error = ref(null)

  const fetchMetrics = async (params = {}) => {
    loading.value = true
    try {
      const { data } = await api.get('/dashboard/metrics', { params })
      metrics.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchChartData = async (type, params = {}) => {
    loading.value = true
    try {
      const { data } = await api.get(`/dashboard/charts/${type}`, { params })
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
    fetchChartData
  }
} 