import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { date } from 'quasar'
import { orderBy } from 'lodash'
import { useNotification } from './useNotification'
import { useTickets } from './useTickets'
import { api } from '../services/api'

export function useTicketAttendance() {
  const router = useRouter()
  const { notify } = useNotification()
  const { getTicketById } = useTickets()

  // Estado
  const tickets = ref([])
  const focusedTicket = ref({
    contacts: {
      tags: [],
      wallets: [],
      extraInfo: []
    }
  })
  const messages = ref([])
  const hasMore = ref(false)

  // Computed
  const orderedMessages = computed(() => {
    return orderBy(messages.value, 
      (obj) => date.parseISO(obj.timestamp || obj.createdAt), 
      ['asc']
    )
  })

  const orderedTickets = computed(() => {
    return orderBy(tickets.value,
      (obj) => date.parseISO(obj.lastMessageAt || obj.updatedAt),
      ['asc']
    )
  })

  // Métodos
  const checkTicketFilter = (ticket) => {
    const defaultFilter = {
      searchParam: '',
      pageNumber: 1,
      status: ['open', 'pending', 'closed'],
      showAll: false,
      count: null,
      queuesIds: [],
      withUnreadMessages: false,
      isNotAssignedUser: false,
      includeNotQueueDefined: true
    }

    const settings = JSON.parse(localStorage.getItem('configuracoes') || '[]')
    const filters = JSON.parse(localStorage.getItem('filtrosAtendimento')) || defaultFilter
    const user = JSON.parse(localStorage.getItem('usuario'))
    const userQueues = JSON.parse(localStorage.getItem('queues') || '[]')
    const registeredQueues = JSON.parse(localStorage.getItem('filasCadastradas') || '[]')
    const profile = localStorage.getItem('profile')
    
    const isAdminShowAll = profile === 'admin' && filters.showAll
    const isQueuesTenantExists = registeredQueues.length > 0
    const userId = user?.userId || +localStorage.getItem('userId')

    // Verificações de filtro
    if (isAdminShowAll) return true
    if (ticket.isGroup) return true
    if (filters.status.length > 0 && !filters.status.includes(ticket.status)) return false
    if (ticket?.userId == userId) return true

    // Verificar configurações específicas
    const notViewTicketsChatBot = settings.find(c => c.key === 'NotViewTicketsChatBot')?.value === 'enabled'
    const directTicketsToWallets = settings.find(c => c.key === 'DirectTicketsToWallets')?.value === 'enabled'
    const notViewAssignedTickets = settings.find(c => c.key === 'NotViewAssignedTickets')?.value === 'enabled'

    if (notViewTicketsChatBot && ticket.autoReplyId && !ticket?.userId && !ticket.queueId) {
      return false
    }

    // Verificar filas
    if (isQueuesTenantExists) {
      const isQueueUser = userQueues.findIndex(q => ticket.queueId === q.id) !== -1
      if (!isQueueUser) return false
    }

    if (isQueuesTenantExists && filters?.queuesIds.length) {
      const isQueue = filters.queuesIds.includes(ticket.queueId)
      if (!isQueue) return false
    }

    // Verificar carteiras
    if (directTicketsToWallets && ticket?.contact?.wallets?.length > 0) {
      return ticket.contact.wallets.some(w => w.id == userId)
    }

    // Verificar atribuições
    if (notViewAssignedTickets && ticket?.userId !== userId) {
      return !ticket?.userId
    }

    if (filters.isNotAssignedUser) {
      return !ticket.userId
    }

    return true
  }

  const loadTickets = (newTickets) => {
    const filteredTickets = newTickets.filter(ticket => checkTicketFilter(ticket))
    tickets.value = filteredTickets
  }

  const updateTicket = (updatedTicket) => {
    const index = tickets.value.findIndex(t => t.id === updatedTicket.id)
    if (index !== -1) {
      tickets.value[index] = {
        ...tickets.value[index],
        ...updatedTicket,
        username: updatedTicket?.user?.name || updatedTicket?.username || tickets.value[index].username,
        profilePicUrl: updatedTicket?.contact?.profilePicUrl || updatedTicket?.profilePicUrl || tickets.value[index].profilePicUrl,
        name: updatedTicket?.contact?.name || updatedTicket?.name || tickets.value[index].name
      }

      if (focusedTicket.value.id === updatedTicket.id) {
        focusedTicket.value = {
          ...focusedTicket.value,
          ...updatedTicket
        }
      }
    }
  }

  const openChatMessages = async (ticketId) => {
    try {
      focusedTicket.value = {}
      messages.value = []
      
      const ticket = await getTicketById(ticketId)
      focusedTicket.value = ticket
      
      const params = {
        ticketId,
        pageNumber: 1
      }
      
      await loadMessages(params)
      await router.push({ 
        name: 'chat', 
        params, 
        query: { t: new Date().getTime() } 
      })
    } catch (error) {
      notify({
        type: 'negative',
        message: error.response?.data?.error || 'Erro ao abrir chat',
        position: 'top'
      })
    }
  }

  const loadMessages = async (params) => {
    try {
      const response = await api.get(`/messages/${params.ticketId}`, { params })
      hasMore.value = response.data.hasMore
      
      if (params.pageNumber === 1) {
        messages.value = [...response.data.messages, ...response.data.messagesOffLine]
      } else {
        messages.value = [...response.data.messages, ...response.data.messagesOffLine, ...messages.value]
      }
    } catch (error) {
      notify({
        type: 'negative',
        message: 'Erro ao carregar mensagens',
        position: 'top'
      })
    }
  }

  return {
    // Estado
    tickets,
    focusedTicket,
    messages,
    hasMore,
    
    // Computed
    orderedMessages,
    orderedTickets,
    
    // Métodos
    loadTickets,
    updateTicket,
    openChatMessages,
    loadMessages,
    checkTicketFilter
  }
}
