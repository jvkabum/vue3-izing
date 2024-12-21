import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/service/api'
import { useSocket } from '@/composables/integracoes/useSocket'

export function useDashboard() {
  const $q = useQuasar()
  const { socket } = useSocket()

  // Estado
  const metrics = ref({
    tickets: {
      total: 0,
      pending: 0,
      open: 0,
      closed: 0,
      averageResponseTime: 0,
      averageResolutionTime: 0
    },
    messages: {
      total: 0,
      sent: 0,
      received: 0,
      automated: 0
    },
    users: {
      total: 0,
      online: 0,
      busy: 0,
      offline: 0
    }
  })
  const loading = ref(false)
  const error = ref(null)
  const dateRange = ref({
    start: new Date(new Date().setHours(0, 0, 0, 0)),
    end: new Date(new Date().setHours(23, 59, 59, 999))
  })

  // Computed Properties
  const ticketMetrics = computed(() => metrics.value.tickets)
  const messageMetrics = computed(() => metrics.value.messages)
  const userMetrics = computed(() => metrics.value.users)

  const resolutionRate = computed(() => {
    const total = metrics.value.tickets.total
    const closed = metrics.value.tickets.closed
    return total > 0 ? (closed / total) * 100 : 0
  })

  const averageResponseTime = computed(() => {
    const minutes = metrics.value.tickets.averageResponseTime
    if (minutes < 60) return `${Math.round(minutes)}min`
    const hours = minutes / 60
    if (hours < 24) return `${Math.round(hours)}h`
    const days = hours / 24
    return `${Math.round(days)}d`
  })

  // Métodos
  const fetchMetrics = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const searchParams = {
        startDate: dateRange.value.start.toISOString(),
        endDate: dateRange.value.end.toISOString(),
        ...params
      }

      const { data } = await api.get('/dashboard/metrics', { params: searchParams })
      metrics.value = data
      return data
    } catch (err) {
      error.value = 'Erro ao carregar métricas'
      console.error('Erro ao carregar métricas:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchChartData = async (type, params = {}) => {
    try {
      loading.value = true
      error.value = null

      const searchParams = {
        startDate: dateRange.value.start.toISOString(),
        endDate: dateRange.value.end.toISOString(),
        ...params
      }

      const { data } = await api.get(`/dashboard/charts/${type}`, { params: searchParams })
      return data
    } catch (err) {
      error.value = 'Erro ao carregar dados do gráfico'
      console.error('Erro ao carregar dados do gráfico:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDateRange = async (start, end) => {
    dateRange.value = { start, end }
    return fetchMetrics()
  }

  // Socket handlers
  const handleMetricsUpdate = (data) => {
    metrics.value = {
      ...metrics.value,
      ...data
    }
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('dashboard:update', handleMetricsUpdate)
  }

  const removeSocketListeners = () => {
    socket.value?.off('dashboard:update', handleMetricsUpdate)
  }

  // Lifecycle hooks
  onMounted(() => {
    setupSocketListeners()
    fetchMetrics()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    metrics,
    loading,
    error,
    dateRange,

    // Computed
    ticketMetrics,
    messageMetrics,
    userMetrics,
    resolutionRate,
    averageResponseTime,

    // Métodos
    fetchMetrics,
    fetchChartData,
    updateDateRange
  }
}
