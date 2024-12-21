import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { format, startOfDay, endOfDay, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useStatistics() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()

  // Estado
  const loading = ref(false)
  const error = ref(null)
  const dateRange = ref([startOfDay(subDays(new Date(), 7)), endOfDay(new Date())])
  const metrics = ref({
    tickets: {
      total: 0,
      open: 0,
      pending: 0,
      closed: 0,
      avgResponseTime: 0,
      avgResolutionTime: 0
    },
    messages: {
      total: 0,
      sent: 0,
      received: 0,
      automated: 0
    },
    users: {
      total: 0,
      active: 0,
      online: 0
    },
    queues: {
      distribution: {},
      waitingTimes: {}
    }
  })
  const chartData = ref({
    tickets: [],
    messages: [],
    users: [],
    queues: []
  })

  // Computed
  const formattedDateRange = computed(() => {
    if (!dateRange.value?.[0] || !dateRange.value?.[1]) return ''
    
    return `${format(dateRange.value[0], 'PP', { locale: ptBR })} - ${format(dateRange.value[1], 'PP', { locale: ptBR })}`
  })

  const ticketsByStatus = computed(() => ({
    labels: ['Abertos', 'Pendentes', 'Fechados'],
    data: [
      metrics.value.tickets.open,
      metrics.value.tickets.pending,
      metrics.value.tickets.closed
    ]
  }))

  const messageDistribution = computed(() => ({
    labels: ['Enviadas', 'Recebidas', 'Automatizadas'],
    data: [
      metrics.value.messages.sent,
      metrics.value.messages.received,
      metrics.value.messages.automated
    ]
  }))

  const queueDistribution = computed(() => ({
    labels: Object.keys(metrics.value.queues.distribution),
    data: Object.values(metrics.value.queues.distribution)
  }))

  // Métodos
  const loadStatistics = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const searchParams = {
        startDate: dateRange.value[0].toISOString(),
        endDate: dateRange.value[1].toISOString(),
        ...params
      }

      const { data } = await api.get('/statistics', { params: searchParams })
      metrics.value = data.metrics
      chartData.value = data.charts

      return data
    } catch (err) {
      error.value = 'Erro ao carregar estatísticas'
      console.error('Erro ao carregar estatísticas:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportReport = async (format = 'pdf') => {
    try {
      loading.value = true
      error.value = null

      const params = {
        startDate: dateRange.value[0].toISOString(),
        endDate: dateRange.value[1].toISOString(),
        format
      }

      const { data } = await api.get('/statistics/export', {
        params,
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio_${format(new Date(), 'yyyy-MM-dd')}.${format}`
      link.click()
      window.URL.revokeObjectURL(url)

      $q.notify({
        type: 'positive',
        message: 'Relatório exportado com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao exportar relatório'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getQueueMetrics = (queueId) => {
    return {
      tickets: chartData.value.queues.find(q => q.id === queueId)?.tickets || [],
      waitingTime: metrics.value.queues.waitingTimes[queueId] || 0
    }
  }

  const getUserMetrics = (userId) => {
    return chartData.value.users.find(u => u.id === userId) || {
      tickets: 0,
      messages: 0,
      avgResponseTime: 0
    }
  }

  const getChartOptions = (type = 'line') => {
    const baseOptions = {
      chart: {
        type,
        height: 350,
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      xaxis: {
        type: 'datetime',
        labels: {
          format: 'dd/MM'
        }
      },
      yaxis: {
        labels: {
          formatter: (value) => Math.round(value)
        }
      },
      tooltip: {
        x: {
          format: 'dd/MM/yyyy'
        }
      },
      theme: {
        mode: $q.dark.isActive ? 'dark' : 'light'
      }
    }

    if (type === 'pie' || type === 'donut') {
      return {
        ...baseOptions,
        chart: {
          type,
          height: 350
        },
        legend: {
          position: 'bottom'
        },
        labels: []
      }
    }

    return baseOptions
  }

  // Socket handlers
  const handleStatsUpdate = (data) => {
    metrics.value = {
      ...metrics.value,
      ...data
    }
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('statistics:update', handleStatsUpdate)
  }

  const removeSocketListeners = () => {
    socket.value?.off('statistics:update', handleStatsUpdate)
  }

  // Lifecycle
  onMounted(() => {
    setupSocketListeners()
    loadStatistics()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  // Watch date range changes
  watch(dateRange, () => {
    loadStatistics()
  })

  return {
    // Estado
    loading,
    error,
    dateRange,
    metrics,
    chartData,

    // Computed
    formattedDateRange,
    ticketsByStatus,
    messageDistribution,
    queueDistribution,

    // Métodos
    loadStatistics,
    exportReport,
    getQueueMetrics,
    getUserMetrics,
    getChartOptions
  }
}
