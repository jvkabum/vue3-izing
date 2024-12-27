import { ref, computed } from 'vue'
import { useAtendimentoNotification } from './useAtendimentoNotification'
import { useAtendimentoStore } from 'src/stores/atendimento'
import { useUserState } from './useUserState'
import { useQueueState } from './useQueueState'

export function useTicketState() {
  const store = useAtendimentoStore()
  const notification = useAtendimentoNotification()
  const { currentUser, isAdmin } = useUserState()
  const { selectedQueues } = useQueueState()

  // Estado
  const loading = ref(false)
  const searchQuery = ref('')
  const showAllTickets = ref(false)
  const showUnreadOnly = ref(false)
  const showUnassignedOnly = ref(false)
  const activeTab = ref('open')

  // Computed
  const tickets = computed(() => store.tickets)
  const ticketFocado = computed(() => store.ticketFocado)

  const filteredTickets = computed(() => {
    let filtered = [...tickets.value]

    // Filtro por texto
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(ticket => 
        ticket.contact?.name?.toLowerCase().includes(query) ||
        ticket.lastMessage?.toLowerCase().includes(query) ||
        ticket.id?.toString().includes(query)
      )
    }

    // Filtro por status
    if (!showAllTickets.value) {
      filtered = filtered.filter(ticket => 
        ticket.status === activeTab.value
      )
    }

    // Filtro por filas
    if (selectedQueues.value.length) {
      filtered = filtered.filter(ticket => 
        selectedQueues.value.includes(ticket.queueId)
      )
    }

    // Filtro por não lidas
    if (showUnreadOnly.value) {
      filtered = filtered.filter(ticket => 
        ticket.unreadMessages > 0
      )
    }

    // Filtro por não atribuídos
    if (showUnassignedOnly.value) {
      filtered = filtered.filter(ticket => 
        !ticket.userId
      )
    }

    // Filtro por permissão
    if (!isAdmin.value) {
      filtered = filtered.filter(ticket => 
        !ticket.userId || 
        ticket.userId === currentUser.value?.id ||
        selectedQueues.value.includes(ticket.queueId)
      )
    }

    return filtered
  })

  // Métodos
  const setSearchQuery = query => {
    searchQuery.value = query
  }

  const setActiveTab = tab => {
    activeTab.value = tab
  }

  const toggleShowAllTickets = () => {
    showAllTickets.value = !showAllTickets.value
  }

  const toggleUnreadOnly = () => {
    showUnreadOnly.value = !showUnreadOnly.value
  }

  const toggleUnassignedOnly = () => {
    showUnassignedOnly.value = !showUnassignedOnly.value
  }

  const focusTicket = async ticket => {
    try {
      loading.value = true
      await store.setTicketFocado(ticket)
    } catch {
      notification.notifyError('Erro ao focar ticket')
    } finally {
      loading.value = false
    }
  }

  const clearTicketFocus = () => {
    store.clearTicketFocado()
  }

  const updateTicketStatus = async (ticketId, status) => {
    try {
      loading.value = true
      await store.updateTicketStatus(ticketId, status)
      notification.notifySuccess(`Status do ticket atualizado para ${status}`)
    } catch {
      notification.notifyError('Erro ao atualizar status do ticket')
    } finally {
      loading.value = false
    }
  }

  const resetState = () => {
    searchQuery.value = ''
    showAllTickets.value = false
    showUnreadOnly.value = false
    showUnassignedOnly.value = false
    activeTab.value = 'open'
  }

  return {
    // Estado
    loading,
    searchQuery,
    showAllTickets,
    showUnreadOnly,
    showUnassignedOnly,
    activeTab,

    // Computed
    tickets,
    ticketFocado,
    filteredTickets,

    // Métodos
    setSearchQuery,
    setActiveTab,
    toggleShowAllTickets,
    toggleUnreadOnly,
    toggleUnassignedOnly,
    focusTicket,
    clearTicketFocus,
    updateTicketStatus,
    resetState
  }
}
