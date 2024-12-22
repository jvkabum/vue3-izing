import { ref, computed } from 'vue'
import request from 'src/service/request'
import { useQuasar } from 'quasar'

export function useDashboard() {
  const $q = useQuasar()
  const loading = ref(false)
  const error = ref(null)
  
  // Dados do Dashboard
  const dashboardData = ref({
    tickets: {
      total: 0,
      open: 0,
      pending: 0,
      closed: 0,
      averageResponseTime: 0,
      averageResolutionTime: 0
    },
    messages: {
      total: 0,
      sent: 0,
      received: 0,
      averagePerTicket: 0
    },
    users: {
      total: 0,
      active: 0,
      inactive: 0
    },
    queues: {
      total: 0,
      withTickets: 0,
      withoutTickets: 0
    }
  })

  // Computed Properties
  const ticketMetrics = computed(() => ({
    total: dashboardData.value.tickets.total,
    open: dashboardData.value.tickets.open,
    pending: dashboardData.value.tickets.pending,
    closed: dashboardData.value.tickets.closed,
    averageResponseTime: formatTime(dashboardData.value.tickets.averageResponseTime),
    averageResolutionTime: formatTime(dashboardData.value.tickets.averageResolutionTime)
  }))

  const messageMetrics = computed(() => ({
    total: dashboardData.value.messages.total,
    sent: dashboardData.value.messages.sent,
    received: dashboardData.value.messages.received,
    averagePerTicket: dashboardData.value.messages.averagePerTicket.toFixed(1)
  }))

  const userMetrics = computed(() => ({
    total: dashboardData.value.users.total,
    active: dashboardData.value.users.active,
    inactive: dashboardData.value.users.inactive,
    activePercentage: ((dashboardData.value.users.active / dashboardData.value.users.total) * 100).toFixed(1)
  }))

  const queueMetrics = computed(() => ({
    total: dashboardData.value.queues.total,
    withTickets: dashboardData.value.queues.withTickets,
    withoutTickets: dashboardData.value.queues.withoutTickets,
    utilizationRate: ((dashboardData.value.queues.withTickets / dashboardData.value.queues.total) * 100).toFixed(1)
  }))

  // Métodos
  const loadDashboardData = async (params = {}) => {
    loading.value = true
    try {
      const { data } = await request({
        url: '/dashboard',
        method: 'get',
        params
      })
      dashboardData.value = data
      return data
    } catch (err) {
      error.value = err?.data?.error || err.message
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar dados do dashboard',
        position: 'top'
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportDashboardData = async (format = 'pdf') => {
    loading.value = true
    try {
      const { data } = await request({
        url: `/dashboard/export/${format}`,
        method: 'get',
        responseType: 'blob'
      })

      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `dashboard-report.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      $q.notify({
        type: 'positive',
        message: 'Relatório exportado com sucesso',
        position: 'top'
      })
    } catch (err) {
      error.value = err?.data?.error || err.message
      $q.notify({
        type: 'negative',
        message: 'Erro ao exportar relatório',
        position: 'top'
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helpers
  const formatTime = (minutes) => {
    if (!minutes) return '0min'
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  return {
    // Estado
    loading,
    error,
    dashboardData,

    // Computed
    ticketMetrics,
    messageMetrics,
    userMetrics,
    queueMetrics,

    // Métodos
    loadDashboardData,
    exportDashboardData
  }
}
