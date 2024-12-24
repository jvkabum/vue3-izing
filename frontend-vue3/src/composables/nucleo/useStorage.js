import { reactive, readonly } from 'vue'
import { useCache } from './useCache'

const state = reactive({
  user: null,
  settings: {},
  tickets: [],
  contacts: [],
  queues: [],
  whatsapp: {
    connected: false,
    qrcode: null,
    status: 'disconnected'
  },
  ui: {
    darkMode: false,
    sidebarCollapsed: false,
    currentView: null
  }
})

const cache = useCache()

export function useStore() {
  // Getters
  const getState = () => readonly(state)
  
  const getUser = () => state.user
  const getSettings = () => state.settings
  const getTickets = () => state.tickets
  const getContacts = () => state.contacts
  const getQueues = () => state.queues
  const getWhatsappStatus = () => state.whatsapp
  const getUI = () => state.ui

  // Mutations
  const setUser = (user) => {
    state.user = user
    cache.setPersistentCache('user', user)
  }

  const setSettings = (settings) => {
    state.settings = settings
    cache.setPersistentCache('settings', settings)
  }

  const setTickets = (tickets) => {
    state.tickets = tickets
  }

  const addTicket = (ticket) => {
    state.tickets.push(ticket)
  }

  const updateTicket = (ticketId, updates) => {
    const index = state.tickets.findIndex(t => t.id === ticketId)
    if (index !== -1) {
      state.tickets[index] = { ...state.tickets[index], ...updates }
    }
  }

  const setWhatsappStatus = (status) => {
    state.whatsapp = { ...state.whatsapp, ...status }
  }

  const setUIState = (updates) => {
    state.ui = { ...state.ui, ...updates }
    cache.setPersistentCache('ui', state.ui)
  }

  // Inicialização
  const initializeStore = async () => {
    // Carrega dados do cache
    const cachedUser = await cache.getPersistentCache('user')
    const cachedSettings = await cache.getPersistentCache('settings')
    const cachedUI = await cache.getPersistentCache('ui')

    if (cachedUser) state.user = cachedUser
    if (cachedSettings) state.settings = cachedSettings
    if (cachedUI) state.ui = cachedUI
  }

  return {
    // Getters
    getState,
    getUser,
    getSettings,
    getTickets,
    getContacts,
    getQueues,
    getWhatsappStatus,
    getUI,

    // Mutations
    setUser,
    setSettings,
    setTickets,
    addTicket,
    updateTicket,
    setWhatsappStatus,
    setUIState,

    // Initialize
    initializeStore
  }
} 