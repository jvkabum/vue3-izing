import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'
import { format, parseISO, startOfDay, endOfDay, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useReports() {
  // Composables
  const $q = useQuasar()
  const { isAdmin } = useAuth()
  const { notify } = useNotification()

  // Estado
  const loading = ref(false)
  const error = ref(null)
  const dateRange = ref([startOfDay(subDays(new Date(), 30)), endOfDay(new Date())])
  const filters = ref({
    users: [],
    queues: [],
    tags: [],
    status: [],
    groupBy: 'day'
  })
  const reportData = ref(null)

  // Tipos de relatório
  const reportTypes = {
    tickets: {
      name: 'Atendimentos',
      description: 'Relatório de atendimentos realizados',
      icon: 'mdi-ticket',
      color: 'primary'
    },
    messages: {
      name: 'Mensagens',
      description: 'Relatório de mensagens trocadas',
      icon: 'mdi-message',
      color: 'secondary'
    },
    users: {
      name: 'Usuários',
      description: 'Relatório de desempenho dos usuários',
      icon: 'mdi-account-group',
      color: 'info'
    },
    queues: {
      name: 'Filas',
      description: 'Relatório de filas de atendimento',
      icon: 'mdi-arrow-decision',
      color: 'warning'
    },
    contacts: {
      name: 'Contatos',
      description: 'Relatório de contatos e interações',
      icon: 'mdi-contacts',
      color: 'positive'
    }
  }

  // Computed
  const formattedDateRange = computed(() => {
    if (!dateRange.value?.[0] || !dateRange.value?.[1]) return ''
    
    return `${format(dateRange.value[0], 'PP', { locale: ptBR })} - ${format(dateRange.value[1], 'PP', { locale: ptBR })}`
  })

  // Métodos
  const generateReport = async (type, params = {}) => {
    try {
      loading.value = true
      error.value = null

      const searchParams = {
        startDate: dateRange.value[0].toISOString(),
        endDate: dateRange.value[1].toISOString(),
        ...filters.value,
        ...params
      }

      const { data } = await api.get(`/reports/${type}`, { params: searchParams })
      reportData.value = data

      return data
    } catch (err) {
      error.value = 'Erro ao gerar relatório'
      console.error('Erro ao gerar relatório:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportReport = async (type, format = 'xlsx', params = {}) => {
    try {
      loading.value = true
      error.value = null

      const searchParams = {
        startDate: dateRange.value[0].toISOString(),
        endDate: dateRange.value[1].toISOString(),
        format,
        ...filters.value,
        ...params
      }

      const { data } = await api.get(`/reports/${type}/export`, {
        params: searchParams,
        responseType: 'blob'
      })

      const fileName = `relatorio_${type}_${format(new Date(), 'yyyy-MM-dd')}.${format}`
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)

      notify({
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

  const formatMetric = (value, type = 'number') => {
    switch (type) {
      case 'time':
        const hours = Math.floor(value / 3600)
        const minutes = Math.floor((value % 3600) / 60)
        const seconds = value % 60
        return `${hours}h ${minutes}m ${seconds}s`
      
      case 'percentage':
        return `${Math.round(value * 100)}%`
      
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value)
      
      case 'number':
      default:
        return new Intl.NumberFormat('pt-BR').format(value)
    }
  }

  const getReportSummary = (data = reportData.value) => {
    if (!data) return null

    return {
      total: data.total,
      average: data.average,
      minimum: data.minimum,
      maximum: data.maximum,
      median: data.median,
      trend: data.trend
    }
  }

  const getReportMetrics = (data = reportData.value) => {
    if (!data) return []

    return Object.entries(data.metrics || {}).map(([key, value]) => ({
      key,
      label: value.label,
      value: value.value,
      type: value.type,
      formattedValue: formatMetric(value.value, value.type),
      trend: value.trend,
      color: value.trend > 0 ? 'positive' : value.trend < 0 ? 'negative' : 'grey'
    }))
  }

  const downloadTemplate = async (type) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get(`/reports/${type}/template`, {
        responseType: 'blob'
      })

      const fileName = `modelo_${type}.xlsx`
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)

      notify({
        type: 'positive',
        message: 'Modelo baixado com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao baixar modelo'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Lifecycle
  onMounted(() => {
    // Carregar filtros salvos
    const savedFilters = localStorage.getItem('reportFilters')
    if (savedFilters) {
      try {
        filters.value = JSON.parse(savedFilters)
      } catch (err) {
        console.error('Erro ao carregar filtros:', err)
      }
    }
  })

  // Watch filters
  watch(filters, (newFilters) => {
    localStorage.setItem('reportFilters', JSON.stringify(newFilters))
  }, { deep: true })

  return {
    // Estado
    loading,
    error,
    dateRange,
    filters,
    reportData,

    // Constantes
    reportTypes,

    // Computed
    formattedDateRange,

    // Métodos
    generateReport,
    exportReport,
    getChartOptions,
    formatMetric,
    getReportSummary,
    getReportMetrics,
    downloadTemplate
  }
}
