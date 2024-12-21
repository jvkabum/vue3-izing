import { ref } from 'vue'
import { useNotification } from '@/composables/useNotification'
import { useLogger } from './useLogger'
import { useRouter } from 'vue-router'

export function useErrorHandler() {
  const { showNotification } = useNotification()
  const { logError } = useLogger()
  const router = useRouter()
  
  const lastError = ref(null)
  const errorCount = ref(0)

  // Tipos de erro
  const ERROR_TYPES = {
    VALIDATION: 'validation',
    API: 'api',
    AUTH: 'auth',
    NETWORK: 'network',
    BUSINESS: 'business',
    UNKNOWN: 'unknown'
  }

  // Determina o tipo de erro
  const getErrorType = (error) => {
    if (error.response?.status === 422) return ERROR_TYPES.VALIDATION
    if (error.response?.status === 401) return ERROR_TYPES.AUTH
    if (error.response?.status === 403) return ERROR_TYPES.AUTH
    if (error.message?.includes('Network')) return ERROR_TYPES.NETWORK
    if (error.isBusinessError) return ERROR_TYPES.BUSINESS
    return ERROR_TYPES.UNKNOWN
  }

  // Trata o erro baseado no tipo
  const handleError = (error, context = '') => {
    const errorType = getErrorType(error)
    const errorInfo = {
      type: errorType,
      message: error.message || 'Erro desconhecido',
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack,
      data: {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      }
    }

    // Registra o erro
    lastError.value = errorInfo
    errorCount.value++

    // Log do erro
    logError(errorInfo.message, 'error', errorInfo)

    // Tratamento específico por tipo
    switch (errorType) {
      case ERROR_TYPES.VALIDATION:
        handleValidationError(error)
        break
      
      case ERROR_TYPES.AUTH:
        handleAuthError(error)
        break
      
      case ERROR_TYPES.NETWORK:
        handleNetworkError(error)
        break
      
      case ERROR_TYPES.BUSINESS:
        handleBusinessError(error)
        break
      
      default:
        handleUnknownError(error)
    }

    return errorInfo
  }

  // Handlers específicos
  const handleValidationError = (error) => {
    const messages = Object.values(error.response.data.errors).flat()
    showNotification({
      type: 'negative',
      message: 'Erro de validação',
      caption: messages.join(', '),
      timeout: 5000
    })
  }

  const handleAuthError = (error) => {
    showNotification({
      type: 'negative',
      message: 'Erro de autenticação',
      caption: 'Sua sessão expirou. Por favor, faça login novamente.',
      timeout: 5000
    })
    router.push('/login')
  }

  const handleNetworkError = (error) => {
    showNotification({
      type: 'negative',
      message: 'Erro de conexão',
      caption: 'Verifique sua conexão com a internet.',
      timeout: 5000
    })
  }

  const handleBusinessError = (error) => {
    showNotification({
      type: 'warning',
      message: error.message,
      timeout: 5000
    })
  }

  const handleUnknownError = (error) => {
    showNotification({
      type: 'negative',
      message: 'Erro inesperado',
      caption: 'Por favor, tente novamente mais tarde.',
      timeout: 5000
    })
  }

  // Registra handler global
  if (process.env.NODE_ENV === 'production') {
    window.onerror = (message, source, lineno, colno, error) => {
      handleError(error, 'window.onerror')
    }

    window.addEventListener('unhandledrejection', (event) => {
      handleError(event.reason, 'unhandledrejection')
    })
  }

  return {
    lastError,
    errorCount,
    ERROR_TYPES,
    handleError
  }
} 