import { computed } from 'vue'
import { useAtendimentoStore } from '../../stores/atendimento'
import { useAtendimentoFilters } from './useAtendimentoFilters'
import { useAtendimentoTabs } from './useAtendimentoTabs'

export function useAtendimentoState() {
  const store = useAtendimentoStore()
  const { filterTickets } = useAtendimentoFilters()
  const { updateTabCounts } = useAtendimentoTabs()

  // Getters
  const tickets = computed(() => store.getTickets)
  const ticketFocado = computed(() => store.getTicketFocado)
  const messages = computed(() => store.getMessages)
  const hasMore = computed(() => store.getHasMore)
  const isLoading = computed(() => store.isLoading)

  // Computed
  const filteredTickets = computed(() => {
    const filtered = filterTickets(tickets.value)
    updateTabCounts(filtered)
    return filtered
  })

  // Actions
  async function loadTickets() {
    store.setLoading(true)
    try {
      await store.loadTickets()
    } catch (error) {
      console.error('Erro ao carregar tickets:', error)
      throw error
    } finally {
      store.setLoading(false)
    }
  }

  async function loadMessages(ticketId, params = {}) {
    store.setLoading(true)
    try {
      await store.loadMessages(ticketId, params)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      throw error
    } finally {
      store.setLoading(false)
    }
  }

  function focusTicket(ticket) {
    store.setTicketFocado(ticket)
    if (ticket?.id) {
      loadMessages(ticket.id)
    }
  }

  function unfocusTicket() {
    store.clearTicketFocado()
    store.clearMessages()
  }

  function addMessage(message) {
    store.addMessage(message)
  }

  function updateMessage(messageId, updates) {
    store.updateMessage(messageId, updates)
  }

  function removeMessage(messageId) {
    store.removeMessage(messageId)
  }

  async function updateTicketStatus(ticketId, status) {
    try {
      await store.updateTicketStatus(ticketId, status)
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }
  }

  function setHasMore(value) {
    store.setHasMore(value)
  }

  function reset() {
    store.reset()
  }

  return {
    // State
    tickets,
    ticketFocado,
    messages,
    hasMore,
    isLoading,
    filteredTickets,

    // Actions
    loadTickets,
    loadMessages,
    focusTicket,
    unfocusTicket,
    addMessage,
    updateMessage,
    removeMessage,
    updateTicketStatus,
    setHasMore,
    reset
  }
}
