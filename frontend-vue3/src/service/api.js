import axios from 'axios'
import { useQuasar } from 'quasar'
import { LocalStorage } from 'quasar'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = LocalStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const $q = useQuasar()
    
    if (error.response) {
      // Erro do servidor
      const status = error.response.status
      const message = error.response.data?.message || 'Erro desconhecido'

      switch (status) {
        case 401:
          // Token inválido ou expirado
          LocalStorage.remove('token')
          window.location.href = '/login'
          break
        case 403:
          $q.notify({
            type: 'negative',
            message: 'Acesso não autorizado',
            caption: message
          })
          break
        case 404:
          $q.notify({
            type: 'negative',
            message: 'Recurso não encontrado',
            caption: message
          })
          break
        case 422:
          $q.notify({
            type: 'negative',
            message: 'Dados inválidos',
            caption: message
          })
          break
        case 500:
          $q.notify({
            type: 'negative',
            message: 'Erro interno do servidor',
            caption: message
          })
          break
        default:
          $q.notify({
            type: 'negative',
            message: 'Erro na requisição',
            caption: message
          })
      }
    } else if (error.request) {
      // Erro de conexão
      $q.notify({
        type: 'negative',
        message: 'Erro de conexão',
        caption: 'Verifique sua conexão com a internet'
      })
    } else {
      // Erro na configuração da requisição
      $q.notify({
        type: 'negative',
        message: 'Erro na requisição',
        caption: error.message
      })
    }

    return Promise.reject(error)
  }
)

export { api }
