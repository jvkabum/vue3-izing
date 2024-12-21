import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Store principal
export const useMainStore = defineStore('main', () => {
  // Estado
  const notifications = ref({ count: 0, tickets: [] })
  const notifications_p = ref({ count: 0, tickets: [] })
  const whatsapps = ref([])
  const usersApp = ref([])
  const ticketFocado = ref({})
  const hasMore = ref(true)

  // Getters (computed)
  const getNotifications = computed(() => notifications.value)
  const getNotificationsP = computed(() => notifications_p.value)
  const getWhatsapps = computed(() => whatsapps.value)
  const getUsersApp = computed(() => usersApp.value)
  const getTicketFocado = computed(() => ticketFocado.value)
  const getHasMore = computed(() => hasMore.value)

  // Actions
  function updateNotifications(data) {
    notifications.value = data
  }

  function updateNotificationsP(data) {
    notifications_p.value = data
  }

  function loadWhatsapps(data) {
    whatsapps.value = data
  }

  function setUsersApp(data) {
    usersApp.value = data
  }

  function setTicketFocado(ticket) {
    ticketFocado.value = ticket
  }

  function setHasMore(value) {
    hasMore.value = value
  }

  async function abrirChatMensagens(ticket) {
    try {
      setTicketFocado(ticket)
      setHasMore(true)
    } catch (error) {
      console.error('Erro ao abrir chat:', error)
    }
  }

  return {
    // Estado
    notifications,
    notifications_p,
    whatsapps,
    usersApp,
    ticketFocado,
    hasMore,

    // Getters
    getNotifications,
    getNotificationsP,
    getWhatsapps,
    getUsersApp,
    getTicketFocado,
    getHasMore,

    // Actions
    updateNotifications,
    updateNotificationsP,
    loadWhatsapps,
    setUsersApp,
    setTicketFocado,
    setHasMore,
    abrirChatMensagens
  }
})

// Store de usuário
export const useUserStore = defineStore('user', () => {
  // Estado
  const user = ref(null)
  const token = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userProfile = computed(() => user.value?.profile || '')

  // Actions
  async function login(credentials) {
    try {
      // Implementar lógica de login
      // const response = await api.post('/login', credentials)
      // user.value = response.data.user
      // token.value = response.data.token
      // localStorage.setItem('token', token.value)
      // localStorage.setItem('user', JSON.stringify(user.value))
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function initializeFromStorage() {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  return {
    // Estado
    user,
    token,

    // Getters
    isAuthenticated,
    userProfile,

    // Actions
    login,
    logout,
    initializeFromStorage
  }
})
