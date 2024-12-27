import axios, { AxiosInstance } from 'axios'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

// Create a custom axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add a response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const router = useRouter()
    const $q = useQuasar()

    if (error.response) {
      const { status } = error.response

      switch (status) {
        case 401:
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          localStorage.removeItem('profile')
          localStorage.removeItem('userId')
          localStorage.removeItem('queues')
          localStorage.removeItem('usuario')
          router.push({ name: 'login' })
          break

        case 403:
          $q.notify({
            type: 'negative',
            message: 'Acesso não autorizado',
            position: 'top'
          })
          break

        default:
          $q.notify({
            type: 'negative',
            message: error.response.data?.message || 'Erro no servidor',
            position: 'top'
          })
      }
    } else if (error.request) {
      $q.notify({
        type: 'negative',
        message: 'Erro de conexão com o servidor',
        position: 'top'
      })
    } else {
      $q.notify({
        type: 'negative',
        message: error.message,
        position: 'top'
      })
    }

    return Promise.reject(error)
  }
)

export { api }
