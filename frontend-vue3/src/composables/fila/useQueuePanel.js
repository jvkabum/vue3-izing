import { ref, computed } from 'vue'
import { api } from '@/services/api'

export function useQueueDashboard() {
  const metrics = ref({})
  const loading = ref(false)
  const error = ref(null)

  const fetchMetrics = async (queueId) => {
    loading.value = true
    try {
      const { data } = await api.get(`/queues/${queueId}/dashboard`)
      metrics.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const averageWaitTime = computed(() => 
    metrics.value.averageWaitTime || 0
  )

  const averageServiceTime = computed(() => 
    metrics.value.averageServiceTime || 0
  )

  const totalTickets = computed(() => ({
    open: metrics.value.openTickets || 0,
    pending: metrics.value.pendingTickets || 0,
    closed: metrics.value.closedTickets || 0
  }))

  const userMetrics = computed(() => 
    metrics.value.userMetrics || []
  )

  return {
    metrics,
    loading,
    error,
    averageWaitTime,
    averageServiceTime,
    totalTickets,
    userMetrics,
    fetchMetrics
  }
} 