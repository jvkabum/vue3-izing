import { ref, computed } from 'vue'
import { useAtendimentoNotification } from './useAtendimentoNotification'
import { useUserStore } from 'src/stores/user'

export function useUserState() {
  const userStore = useUserStore()
  const notification = useAtendimentoNotification()

  // Estado
  const loading = ref(false)
  const selectedUser = ref(null)
  const searchQuery = ref('')

  // Computed
  const users = computed(() => userStore.users)
  const currentUser = computed(() => userStore.currentUser)
  const isAdmin = computed(() => currentUser.value?.profile === 'admin')

  const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value

    const query = searchQuery.value.toLowerCase()
    return users.value.filter(user => 
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    )
  })

  const usersInQueue = computed(() => queueId => {
    if (!queueId) return users.value
    return users.value.filter(user => 
      user.profile === 'admin' || user.queues.includes(queueId)
    )
  })

  // Métodos
  const loadUsers = async () => {
    loading.value = true
    try {
      await userStore.fetchUsers()
    } catch {
      notification.notifyError('Erro ao carregar usuários')
    } finally {
      loading.value = false
    }
  }

  const setSearchQuery = query => {
    searchQuery.value = query
  }

  const selectUser = user => {
    selectedUser.value = user
  }

  const clearSelectedUser = () => {
    selectedUser.value = null
  }

  const getUserById = userId => 
    users.value.find(user => user.id === userId)

  const getUserName = userId => {
    const user = getUserById(userId)
    return user?.name || ''
  }

  const isUserInQueue = (userId, queueId) => {
    const user = getUserById(userId)
    return user?.profile === 'admin' || user?.queues.includes(queueId)
  }

  const canUserAccessQueue = queueId => {
    if (isAdmin.value) return true
    return currentUser.value?.queues.includes(queueId)
  }

  const resetState = () => {
    selectedUser.value = null
    searchQuery.value = ''
  }

  return {
    // Estado
    loading,
    selectedUser,
    searchQuery,

    // Computed
    users,
    currentUser,
    isAdmin,
    filteredUsers,
    usersInQueue,

    // Métodos
    loadUsers,
    setSearchQuery,
    selectUser,
    clearSelectedUser,
    getUserById,
    getUserName,
    isUserInQueue,
    canUserAccessQueue,
    resetState
  }
}
