import { ref, computed } from 'vue'
import { useAtendimentoStore } from 'src/stores/atendimento'
import { useQueueStore } from 'src/stores/queue'

export function useAtendimentoFilters() {
  const atendimentoStore = useAtendimentoStore()
  const queueStore = useQueueStore()

  // Estado
  const searchText = ref('')
  const selectedStatus = ref('open')
  const selectedQueues = ref([])
  const showUnreadOnly = ref(false)
  const showUnassignedOnly = ref(false)
  const showAllTickets = ref(false)

  // Computed
  const queues = computed(() => queueStore.queues)
  const tickets = computed(() => atendimentoStore.tickets)

  const filteredTickets = computed(() => {
    let filtered = [...tickets.value]

    // Filtro por texto
    if (searchText.value) {
      const query = searchText.value.toLowerCase()
      filtered = filtered.filter(ticket => 
        ticket.contact?.name?.toLowerCase().includes(query) ||
        ticket.lastMessage?.toLowerCase().includes(query) ||
        ticket.id?.toString().includes(query)
      )
    }

    // Filtro por status
    if (!showAllTickets.value) {
      filtered = filtered.filter(ticket => 
        ticket.status === selectedStatus.value
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

    return filtered
  })

  // Métodos
  const setSearchText = text => {
    searchText.value = text
  }

  const setSelectedStatus = status => {
    selectedStatus.value = status
  }

  const toggleQueue = queueId => {
    const index = selectedQueues.value.indexOf(queueId)
    if (index === -1) {
      selectedQueues.value.push(queueId)
    } else {
      selectedQueues.value.splice(index, 1)
    }
  }

  const clearQueues = () => {
    selectedQueues.value = []
  }

  const toggleUnreadOnly = () => {
    showUnreadOnly.value = !showUnreadOnly.value
  }

  const toggleUnassignedOnly = () => {
    showUnassignedOnly.value = !showUnassignedOnly.value
  }

  const toggleShowAllTickets = () => {
    showAllTickets.value = !showAllTickets.value
  }

  const resetFilters = () => {
    searchText.value = ''
    selectedStatus.value = 'open'
    selectedQueues.value = []
    showUnreadOnly.value = false
    showUnassignedOnly.value = false
    showAllTickets.value = false
  }

  return {
    // Estado
    searchText,
    selectedStatus,
    selectedQueues,
    showUnreadOnly,
    showUnassignedOnly,
    showAllTickets,

    // Computed
    queues,
    tickets,
    filteredTickets,

    // Métodos
    setSearchText,
    setSelectedStatus,
    toggleQueue,
    clearQueues,
    toggleUnreadOnly,
    toggleUnassignedOnly,
    toggleShowAllTickets,
    resetFilters
  }
}
