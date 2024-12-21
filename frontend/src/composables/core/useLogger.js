import { ref } from 'vue'
import { format } from 'date-fns'
import { useApi } from '@/services/api'

export function useLogger() {
  const logs = ref([])
  const error = ref(null)
  const { api } = useApi()

  // Níveis de log
  const LOG_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  }

  // Categorias de log
  const LOG_CATEGORIES = {
    API: 'api',
    AUTH: 'auth',
    CHAT: 'chat',
    WHATSAPP: 'whatsapp',
    SYSTEM: 'system',
    USER: 'user'
  }

  const createLog = (level, message, category, data = {}) => {
    const log = {
      level,
      message,
      category,
      data,
      timestamp: new Date().toISOString(),
      sessionId: localStorage.getItem('sessionId'),
      userId: localStorage.getItem('userId')
    }

    logs.value.push(log)

    // Limita o número de logs em memória
    if (logs.value.length > 1000) {
      logs.value.shift()
    }

    // Envia para o servidor se não for debug
    if (level !== LOG_LEVELS.DEBUG) {
      sendLogToServer(log)
    }

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console[level](
        `[${format(new Date(), 'HH:mm:ss')}] [${category}] ${message}`,
        data
      )
    }

    return log
  }

  const debug = (message, category = LOG_CATEGORIES.SYSTEM, data) => 
    createLog(LOG_LEVELS.DEBUG, message, category, data)

  const info = (message, category = LOG_CATEGORIES.SYSTEM, data) => 
    createLog(LOG_LEVELS.INFO, message, category, data)

  const warn = (message, category = LOG_CATEGORIES.SYSTEM, data) => 
    createLog(LOG_LEVELS.WARN, message, category, data)

  const logError = (message, category = LOG_CATEGORIES.SYSTEM, data) => 
    createLog(LOG_LEVELS.ERROR, message, category, data)

  // Envia logs para o servidor
  const sendLogToServer = async (log) => {
    try {
      await api.post('/logs', log)
    } catch (err) {
      error.value = err.message
      console.error('Erro ao enviar log:', err)
    }
  }

  // Busca logs
  const fetchLogs = async (filters = {}) => {
    try {
      const { data } = await api.get('/logs', { params: filters })
      return data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Exporta logs
  const exportLogs = async (filters = {}) => {
    try {
      const { data } = await api.get('/logs/export', {
        params: filters,
        responseType: 'blob'
      })

      const fileName = `logs_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    logs,
    error,
    LOG_LEVELS,
    LOG_CATEGORIES,
    debug,
    info,
    warn,
    logError,
    fetchLogs,
    exportLogs
  }
} 