import { ref } from 'vue'
import { useNotification } from './useNotification'
import { useApi } from './useApi'

export function useErrorHandler() {
  const { showNotification } = useNotification()
  const lastError = ref(null)
  const errorCount = ref(0)
  const errorLog = ref([])
  const integrationLogs = ref([])
  const { api } = useApi()

  const handleError = (error, context = '') => {
    const errorInfo = {
      message: error.message || 'Erro desconhecido',
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    }

    // Registra o erro
    lastError.value = errorInfo
    errorCount.value++
    errorLog.value.push(errorInfo)

    // Limita o log a 100 erros
    if (errorLog.value.length > 100) {
      errorLog.value.shift()
    }

    // Notifica o usuário
    showNotification({
      type: 'negative',
      message: errorInfo.message,
      caption: context ? `Contexto: ${context}` : undefined,
      timeout: 5000
    })

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', errorInfo)
    }

    return errorInfo
  }

  const clearErrors = () => {
    lastError.value = null
    errorCount.value = 0
    errorLog.value = []
  }

  const getErrorsByContext = (context) => {
    return errorLog.value.filter(error => error.context === context)
  }

  const fetchIntegrationLogs = async (type = null) => {
    loading.value = true
    try {
      const endpoint = type ? `/integration-logs/${type}` : '/integration-logs'
      const { data } = await api.get(endpoint)
      integrationLogs.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearIntegrationLogs = async (type = null) => {
    loading.value = true
    try {
      const endpoint = type ? `/integration-logs/${type}/clear` : '/integration-logs/clear'
      await api.post(endpoint)
      integrationLogs.value = []
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    lastError,
    errorCount,
    errorLog,
    handleError,
    clearErrors,
    getErrorsByContext,
    integrationLogs,
    fetchIntegrationLogs,
    clearIntegrationLogs
  }
} 