import { ref } from 'vue'
import { api } from '@/services/api'

export function useMetrics() {
  const metrics = ref({})
  const loading = ref(false)
  const error = ref(null)

  const fetchMetrics = async (period = 'today') => {
    loading.value = true
    try {
      const { data } = await api.get(`/metrics/${period}`)
      metrics.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUserMetrics = async (userId, period = 'today') => {
    loading.value = true
    try {
      const { data } = await api.get(`/metrics/users/${userId}/${period}`)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchQueueMetrics = async (queueId, period = 'today') => {
    loading.value = true
    try {
      const { data } = await api.get(`/metrics/queues/${queueId}/${period}`)
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
    fetchUserMetrics,
    fetchQueueMetrics
  }
} 