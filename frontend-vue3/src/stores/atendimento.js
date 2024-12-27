import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ListarTickets, ListarMensagens, AtualizarStatus } from '../service/tickets'

export const useAtendimentoStore = defineStore('atendimento', () => {
  // State
  const tickets = ref([])
  const ticketFocado = ref(null)
  const messages = ref([])
  const hasMore = ref(true)
  const loading = ref(false)

  // Getters
  const getTickets = computed(() => tickets.value)
  const getTicketFocado = computed(() => ticketFocado.value)
  const getMessages = computed(() => messages.value)
  const getHasMore = computed(() => hasMore.value)
  const isLoading = computed(() => loading.value)

  // Actions
  async function loadTickets() {
    loading.value = true
    try {
      const response = await ListarTickets()
      tickets.value = response.data
    } catch (error) {
      console.error('Erro ao carregar tickets:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function loadMessages(ticketId, params = {}) {
    loading.value = true
    try {
      const response = await ListarMensagens(ticketId, params)
      messages.value = response.data.messages
      hasMore.value = response.data.hasMore
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function setTickets(newTickets) {
    tickets.value = newTickets
  }

  function setTicketFocado(ticket) {
    ticketFocado.value = ticket
  }

  function setMessages(newMessages) {
    messages.value = newMessages
  }

  function addMessage(message) {
    messages.value.push(message)
  }

  function updateMessage(messageId, updates) {
    const index = messages.value.findIndex(msg => msg.id === messageId)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates }
    }
  }

  function removeMessage(messageId) {
    messages.value = messages.value.filter(msg => msg.id !== messageId)
  }

  function setHasMore(value) {
    hasMore.value = value
  }

  function setLoading(value) {
    loading.value = value
  }

  async function updateTicketStatus(ticketId, status) {
    try {
      await AtualizarStatus(ticketId, status)
      if (ticketFocado.value?.id === ticketId) {
        ticketFocado.value.status = status
      }
      const index = tickets.value.findIndex(t => t.id === ticketId)
      if (index !== -1) {
        tickets.value[index].status = status
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }
  }

  function clearMessages() {
    messages.value = []
    hasMore.value = true
  }

  function clearTicketFocado() {
    ticketFocado.value = null
  }

  function reset() {
    tickets.value = []
    ticketFocado.value = null
    messages.value = []
    hasMore.value = true
    loading.value = false
  }

  return {
    // State
    tickets,
    ticketFocado,
    messages,
    hasMore,
    loading,

    // Getters
    getTickets,
    getTicketFocado,
    getMessages,
    getHasMore,
    isLoading,

    // Actions
    loadTickets,
    loadMessages,
    setTickets,
    setTicketFocado,
    setMessages,
    addMessage,
    updateMessage,
    removeMessage,
    setHasMore,
    setLoading,
    updateTicketStatus,
    clearMessages,
    clearTicketFocado,
    reset
  }
})
