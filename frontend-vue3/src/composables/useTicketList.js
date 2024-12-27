import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { socketIO } from 'src/utils/socket'

export function useTicketList() {
  const $q = useQuasar()
  const store = useStore()
  const router = useRouter()

  const socket = ref(null)
  const loading = ref(false)
  const countTickets = ref(0)
  const hasMore = ref(true)
  const scrollAreaTickets = ref(null)

  const pesquisaTickets = ref({
    pageNumber: 1,
    count: null
  })

  const getTickets = computed(() => store.getters.getTickets)
  const ticketFocado = computed(() => store.getters.ticketFocado)
  const whatsapps = computed(() => store.getters.whatsapps)

  const onScroll = (info) => {
    if (info.verticalPercentage <= 0.85) return
    onLoadMore()
  }

  const onLoadMore = async () => {
    if (!hasMore.value || loading.value) return

    try {
      loading.value = true
      pesquisaTickets.value.pageNumber++
      await consultarTickets()
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar mais tickets',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  const consultarTickets = async (params = {}, status) => {
    const queryParams = {
      ...pesquisaTickets.value,
      ...params
    }

    if (queryParams.pageNumber === 1) {
      store.commit('RESET_TICKETS', status)
    }

    try {
      const { data } = await api.get('/tickets', { params: queryParams })
      countTickets.value = data.count
      store.commit('LOAD_TICKETS', { type: status, tickets: data.tickets })
      hasMore.value = data.hasMore
      return data
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao consultar tickets',
        caption: err.message,
        position: 'top'
      })
      throw err
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('scrollToBottomMessageChat'))
    }, 200)
  }

  const setupTicketListSocket = (status, showAll, queuesIds) => {
    socket.value = socketIO()
    const usuario = JSON.parse(localStorage.getItem('usuario'))

    const shouldUpdateTicket = (ticket) =>
      (!ticket.userId || ticket.userId === usuario?.userId || showAll) &&
      (!ticket.queueId || queuesIds.indexOf(ticket.queueId) > -1)

    const notBelongsToUserQueues = (ticket) =>
      ticket.queueId && queuesIds.indexOf(ticket.queueId) === -1

    socket.value.on('connect', () => {
      if (status) {
        socket.value.emit(`tenant:${usuario.tenantId}:joinTickets`, status)
      } else {
        socket.value.emit(`tenant:${usuario.tenantId}:joinNotification`)
      }
    })

    socket.value.on(`tenant:${usuario.tenantId}:ticket`, (data) => {
      if (data.action === 'updateUnread') {
        store.commit('RESET_UNREAD', { type: status, ticketId: data.ticketId })
      }

      if (data.action === 'update' && shouldUpdateTicket(data.ticket)) {
        store.commit('UPDATE_TICKET', { type: status, ticket: data.ticket })
      }

      if (data.action === 'update' && notBelongsToUserQueues(data.ticket)) {
        store.commit('DELETE_TICKET', { type: status, ticketId: data.ticket.id })
      }

      if (data.action === 'delete') {
        store.commit('DELETE_TICKET', { type: status, ticketId: data.ticketId })
      }
    })

    socket.value.on(`tenant:${usuario.tenantId}:appMessage`, (data) => {
      if (data.action === 'create' && shouldUpdateTicket(data.ticket)) {
        if (ticketFocado.value.id !== data.ticket.id && status !== 'closed' && !data.message.fromMe && !data.ticket.chatFlowId) {
          window.dispatchEvent(new CustomEvent('handlerNotifications', { detail: data.message }))
        }
        store.commit('UPDATE_TICKET_UNREAD_MESSAGES', { type: status, ticket: data.ticket })
      }
    })

    watch(() => ticketFocado.value.id, (newId) => {
      if (socket.value && newId) {
        socket.value.emit(`tenant:${usuario.tenantId}:joinChatBox`, `${newId}`)
      }
    }, { immediate: true })
  }

  const disconnectSocket = () => {
    if (socket.value) {
      socket.value.disconnect()
    }
  }

  onBeforeUnmount(() => {
    disconnectSocket()
  })

  return {
    socket,
    loading,
    countTickets,
    hasMore,
    scrollAreaTickets,
    pesquisaTickets,
    getTickets,
    ticketFocado,
    whatsapps,
    onScroll,
    onLoadMore,
    consultarTickets,
    scrollToBottom,
    setupTicketListSocket,
    disconnectSocket
  }
}
