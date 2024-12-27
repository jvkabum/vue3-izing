import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'

export function useTickets() {
  // Composables
  const router = useRouter()
  const $q = useQuasar()
  const { socket } = useSocket()

  // Estado
  const tickets = ref([])
  const currentTicket = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const hasMore = ref(true)
  const filters = ref({
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending', 'closed'],
    showAll: false,
    count: null,
    queuesIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
  })

  // Computed
  const sortedTickets = computed(() => {
    return [...tickets.value].sort((a, b) => {
      const dateA = new Date(a.lastMessageAt || a.updatedAt)
      const dateB = new Date(b.lastMessageAt || b.updatedAt)
      return dateB - dateA // Ordem decrescente
    })
  })

  const pendingTickets = computed(() => 
    tickets.value.filter(t => t.status === 'pending')
  )

  const unassignedTickets = computed(() => 
    tickets.value.filter(t => !t.userId)
  )

  const ticketsByQueue = computed(() => {
    const grouped = {}
    tickets.value.forEach(ticket => {
      const queueId = ticket.queueId || 'unassigned'
      if (!grouped[queueId]) {
        grouped[queueId] = []
      }
      grouped[queueId].push(ticket)
    })
    return grouped
  })

  // Métodos
  const loadTickets = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const searchParams = {
        ...filters.value,
        ...params
      }

      const { data } = await api.get('/tickets', { params: searchParams })
      
      hasMore.value = data.hasMore
      
      if (searchParams.pageNumber === 1) {
        tickets.value = data.tickets
      } else {
        tickets.value = [...tickets.value, ...data.tickets]
      }

      return data
    } catch (err) {
      error.value = 'Erro ao carregar tickets'
      console.error('Erro ao carregar tickets:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTicketById = async (ticketId) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get(`/tickets/${ticketId}`)
      currentTicket.value = data
      return data
    } catch (err) {
      error.value = 'Erro ao carregar ticket'
      console.error('Erro ao carregar ticket:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTicketStatus = async (ticketId, status) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.put(`/tickets/${ticketId}`, { status })
      
      const ticket = tickets.value.find(t => t.id === ticketId)
      if (ticket) {
        Object.assign(ticket, data)
      }
      
      if (currentTicket.value?.id === ticketId) {
        currentTicket.value = data
      }

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar status do ticket'
      console.error('Erro ao atualizar status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const assignTicket = async (ticketId, userId) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.put(`/tickets/${ticketId}/assign`, { userId })
      
      const ticket = tickets.value.find(t => t.id === ticketId)
      if (ticket) {
        Object.assign(ticket, data)
      }
      
      if (currentTicket.value?.id === ticketId) {
        currentTicket.value = data
      }

      return data
    } catch (err) {
      error.value = 'Erro ao atribuir ticket'
      console.error('Erro ao atribuir ticket:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = {
      ...filters.value,
      ...newFilters,
      pageNumber: 1 // Reset página ao alterar filtros
    }
    return loadTickets()
  }

  // Socket handlers
  const handleTicketUpdate = (data) => {
    const ticket = tickets.value.find(t => t.id === data.id)
    if (ticket) {
      Object.assign(ticket, data)
    } else {
      tickets.value.unshift(data)
    }

    if (currentTicket.value?.id === data.id) {
      currentTicket.value = data
    }
  }

  const handleTicketDelete = (ticketId) => {
    tickets.value = tickets.value.filter(t => t.id !== ticketId)
    
    if (currentTicket.value?.id === ticketId) {
      currentTicket.value = null
      router.push({ name: 'tickets' })
    }
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('ticket', handleTicketUpdate)
    socket.value?.on('ticketDelete', handleTicketDelete)
  }

  const removeSocketListeners = () => {
    socket.value?.off('ticket', handleTicketUpdate)
    socket.value?.off('ticketDelete', handleTicketDelete)
  }

  // Lifecycle hooks
  onMounted(() => {
    setupSocketListeners()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    tickets: sortedTickets,
    currentTicket,
    loading,
    error,
    hasMore,
    filters,

    // Computed
    pendingTickets,
    unassignedTickets,
    ticketsByQueue,

    // Métodos
    loadTickets,
    getTicketById,
    updateTicketStatus,
    assignTicket,
    updateFilters
  }
}
