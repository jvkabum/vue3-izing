import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'

export function useUsers() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()
  const { isAdmin, user: currentUser } = useAuth()
  const { notify } = useNotification()

  // Estado
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    search: '',
    status: 'all',
    profile: 'all',
    queues: []
  })

  // Perfis disponíveis
  const profiles = {
    admin: {
      name: 'Administrador',
      description: 'Acesso total ao sistema',
      color: 'negative'
    },
    supervisor: {
      name: 'Supervisor',
      description: 'Gerenciamento de equipes e relatórios',
      color: 'warning'
    },
    agent: {
      name: 'Agente',
      description: 'Atendimento ao cliente',
      color: 'positive'
    }
  }

  // Computed
  const filteredUsers = computed(() => {
    let result = [...users.value]

    // Busca
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      )
    }

    // Status
    if (filters.value.status !== 'all') {
      result = result.filter(user => 
        user.status === filters.value.status
      )
    }

    // Perfil
    if (filters.value.profile !== 'all') {
      result = result.filter(user => 
        user.profile === filters.value.profile
      )
    }

    // Filas
    if (filters.value.queues.length) {
      result = result.filter(user => 
        user.queues?.some(queue => 
          filters.value.queues.includes(queue.id)
        )
      )
    }

    return result
  })

  const onlineUsers = computed(() => 
    users.value.filter(u => u.status === 'online')
  )

  const usersByProfile = computed(() => {
    const grouped = {}
    users.value.forEach(user => {
      const profile = user.profile || 'agent'
      if (!grouped[profile]) {
        grouped[profile] = []
      }
      grouped[profile].push(user)
    })
    return grouped
  })

  // Métodos
  const loadUsers = async () => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get('/users')
      users.value = data

      return data
    } catch (err) {
      error.value = 'Erro ao carregar usuários'
      console.error('Erro ao carregar usuários:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post('/users', userData)
      users.value.push(data)

      notify({
        type: 'positive',
        message: 'Usuário criado com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao criar usuário'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (userId, userData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.put(`/users/${userId}`, userData)
      
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = data
      }

      notify({
        type: 'positive',
        message: 'Usuário atualizado com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar usuário'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (userId) => {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/users/${userId}`)
      users.value = users.value.filter(u => u.id !== userId)

      notify({
        type: 'positive',
        message: 'Usuário removido com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao remover usuário'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (userId, profile) => {
    if (!isAdmin.value) {
      notify({
        type: 'negative',
        message: 'Sem permissão para alterar perfil',
        position: 'top'
      })
      return false
    }

    return updateUser(userId, { profile })
  }

  const updateQueues = async (userId, queues) => {
    if (!isAdmin.value) {
      notify({
        type: 'negative',
        message: 'Sem permissão para alterar filas',
        position: 'top'
      })
      return false
    }

    return updateUser(userId, { queues })
  }

  const resetPassword = async (userId) => {
    try {
      loading.value = true
      error.value = null

      await api.post(`/users/${userId}/reset-password`)

      notify({
        type: 'positive',
        message: 'Senha resetada com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao resetar senha'
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleStatus = async (userId) => {
    const user = users.value.find(u => u.id === userId)
    if (!user) return false

    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    return updateUser(userId, { status: newStatus })
  }

  const canManageUser = (userId) => {
    if (isAdmin.value) return true
    if (currentUser.value?.id === userId) return true
    return false
  }

  // Socket handlers
  const handleUserUpdate = (data) => {
    const index = users.value.findIndex(u => u.id === data.id)
    if (index !== -1) {
      users.value[index] = data
    } else {
      users.value.push(data)
    }
  }

  const handleUserDelete = (userId) => {
    users.value = users.value.filter(u => u.id !== userId)
  }

  const handleUserStatus = (data) => {
    const user = users.value.find(u => u.id === data.userId)
    if (user) {
      user.status = data.status
      user.lastActivity = data.lastActivity
    }
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('user:update', handleUserUpdate)
    socket.value?.on('user:delete', handleUserDelete)
    socket.value?.on('user:status', handleUserStatus)
  }

  const removeSocketListeners = () => {
    socket.value?.off('user:update', handleUserUpdate)
    socket.value?.off('user:delete', handleUserDelete)
    socket.value?.off('user:status', handleUserStatus)
  }

  // Lifecycle
  onMounted(() => {
    setupSocketListeners()
    loadUsers()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    users,
    loading,
    error,
    filters,

    // Constantes
    profiles,

    // Computed
    filteredUsers,
    onlineUsers,
    usersByProfile,

    // Métodos
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    updateProfile,
    updateQueues,
    resetPassword,
    toggleStatus,
    canManageUser
  }
}
