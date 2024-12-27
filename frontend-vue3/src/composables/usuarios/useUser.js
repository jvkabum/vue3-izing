import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { useNotification } from './useNotification'

export function useUser() {
  // Composables
  const router = useRouter()
  const $q = useQuasar()
  const { socket } = useSocket()
  const { notify } = useNotification()

  // Estado
  const isAdmin = ref(false)
  const isSupport = ref(false)
  const userData = ref(null)

  // Constantes
  const defaultSearchFilter = {
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending', 'closed'],
    showAll: false,
    count: null,
    queuesIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
  }

  // Computed
  const isSupportUser = computed(() => {
    const supportDomains = ['@']
    if (!userData.value?.email) return false
    
    return supportDomains.some(domain => 
      userData.value.email.toLowerCase().includes(domain.toLowerCase())
    )
  })

  const hasAdminAccess = computed(() => 
    isSupport.value || userData.value?.profile === 'admin'
  )

  // Métodos
  const setUserData = (data) => {
    userData.value = data
    isSupport.value = isSupportUser.value
    isAdmin.value = hasAdminAccess.value
  }

  const login = async (credentials) => {
    try {
      const email = credentials.email.trim()
      const { data } = await api.post('/auth/login', { ...credentials, email })

      // Armazenar dados
      localStorage.setItem('token', JSON.stringify(data.token))
      localStorage.setItem('username', data.username)
      localStorage.setItem('profile', data.profile)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('usuario', JSON.stringify(data))
      localStorage.setItem('queues', JSON.stringify(data.queues))
      
      // Configurar filtros
      const savedFilters = data?.configs?.filtrosAtendimento || defaultSearchFilter
      localStorage.setItem('filtrosAtendimento', JSON.stringify(savedFilters))

      // Configurar tema
      if (data?.configs?.isDark) {
        $q.dark.set(data.configs.isDark)
      }

      // Atualizar estado
      setUserData(data)

      // Notificar socket
      socket.value?.emit(`${data.tenantId}:setUserActive`)

      // Notificar usuário
      notify({
        type: 'positive',
        message: 'Login realizado com sucesso!',
        position: 'top'
      })

      // Redirecionar
      if (data.profile === 'admin') {
        router.push({ name: 'home-dashboard' })
      } else if (data.profile === 'super') {
        router.push({ name: 'empresassuper' })
      } else {
        router.push({ name: 'atendimento' })
      }

      return data
    } catch (err) {
      console.error('Erro no login:', err)
      notify({
        type: 'negative',
        message: err.response?.data?.error || 'Erro ao realizar login',
        position: 'top'
      })
      throw err
    }
  }

  const logout = async () => {
    try {
      // Limpar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('profile')
      localStorage.removeItem('userId')
      localStorage.removeItem('usuario')
      localStorage.removeItem('queues')
      localStorage.removeItem('filtrosAtendimento')

      // Resetar estado
      userData.value = null
      isAdmin.value = false
      isSupport.value = false

      // Redirecionar para login
      router.push({ name: 'login' })
    } catch (err) {
      console.error('Erro no logout:', err)
      notify({
        type: 'negative',
        message: 'Erro ao realizar logout',
        position: 'top'
      })
    }
  }

  const updateUserPreferences = async (preferences) => {
    try {
      const { data } = await api.put('/users/preferences', preferences)
      setUserData({ ...userData.value, ...data })
      return data
    } catch (err) {
      notify({
        type: 'negative',
        message: 'Erro ao atualizar preferências',
        position: 'top'
      })
      throw err
    }
  }

  return {
    // Estado
    isAdmin,
    isSupport,
    userData,

    // Computed
    isSupportUser,
    hasAdminAccess,

    // Métodos
    login,
    logout,
    setUserData,
    updateUserPreferences
  }
}
