import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAtendimentoStore } from 'src/stores/atendimento'
import { useAtendimentoNotification } from './useAtendimentoNotification'

export function useAtendimentoState() {
  const $q = useQuasar()
  const store = useAtendimentoStore()
  const notification = useAtendimentoNotification()

  // Estado local
  const loading = ref(false)
  const drawerOpen = ref($q.screen.gt.sm)
  const activeTab = ref('open')
  const searchQuery = ref('')
  const showAllTickets = ref(false)
  const selectedQueues = ref([])

  // Computed
  const tickets = computed(() => store.getTickets)
  const ticketFocado = computed(() => store.ticketFocado)
  const hasUnreadMessages = computed(() => store.hasUnreadMessages)
  const filteredTickets = computed(() => {
    let filtered = [...tickets.value]

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(ticket => 
        ticket.contact?.name?.toLowerCase().includes(query) ||
        ticket.lastMessage?.toLowerCase().includes(query)
      )
    }

    if (!showAllTickets.value) {
      filtered = filtered.filter(ticket => 
        ticket.status === activeTab.value
      )
    }

    if (selectedQueues.value.length) {
      filtered = filtered.filter(ticket => 
        selectedQueues.value.includes(ticket.queueId)
      )
    }

    return filtered
  })

  // Métodos
  const toggleDrawer = () => {
    drawerOpen.value = !drawerOpen.value
  }

  const setActiveTab = tab => {
    activeTab.value = tab
  }

  const setSearchQuery = query => {
    searchQuery.value = query
  }

  const toggleShowAllTickets = () => {
    showAllTickets.value = !showAllTickets.value
  }

  const updateSelectedQueues = queues => {
    selectedQueues.value = queues
  }

  const focusTicket = async ticket => {
    try {
      loading.value = true
      await store.setTicketFocado(ticket)
    } catch (error) {
      notification.notifyError('Erro ao focar ticket')
    } finally {
      loading.value = false
    }
  }

  const clearTicketFocus = () => {
    store.clearTicketFocado()
  }

  return {
    // Estado
    loading,
    drawerOpen,
    activeTab,
    searchQuery,
    showAllTickets,
    selectedQueues,

    // Computed
    tickets,
    ticketFocado,
    hasUnreadMessages,
    filteredTickets,

    // Métodos
    toggleDrawer,
    setActiveTab,
    setSearchQuery,
    toggleShowAllTickets,
    updateSelectedQueues,
    focusTicket,
    clearTicketFocus
  }
}
