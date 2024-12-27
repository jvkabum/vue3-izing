import { ref, onMounted, onBeforeUnmount } from 'vue'
import { socketIO } from 'src/utils/socket'
import { useAtendimentoNotification } from './useAtendimentoNotification'
import { useAtendimentoStore } from 'src/stores/atendimento'

export function useAtendimentoEvents() {
  const store = useAtendimentoStore()
  const notification = useAtendimentoNotification()
  const socket = ref(null)

  // Estado
  const isConnected = ref(false)
  const lastEvent = ref(null)
  const lastError = ref(null)

  // Métodos
  const connect = () => {
    socket.value = socketIO()
    setupEventListeners()
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  const setupEventListeners = () => {
    if (!socket.value) return

    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (!usuario?.tenantId) return

    socket.value.on('connect', () => {
      isConnected.value = true
      joinRooms()
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
    })

    socket.value.on(`tenant:${usuario.tenantId}:ticket`, data => {
      lastEvent.value = data
      handleTicketEvent(data)
    })

    socket.value.on(`tenant:${usuario.tenantId}:appMessage`, data => {
      lastEvent.value = data
      handleMessageEvent(data)
    })

    socket.value.on('error', error => {
      lastError.value = error
      notification.notifyError('Erro na conexão com o servidor')
    })
  }

  const joinRooms = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (!usuario?.tenantId) return

    socket.value.emit(`tenant:${usuario.tenantId}:joinTickets`)
    socket.value.emit(`tenant:${usuario.tenantId}:joinNotification`)

    const ticketFocado = store.ticketFocado
    if (ticketFocado?.id) {
      socket.value.emit(`tenant:${usuario.tenantId}:joinChatBox`, `${ticketFocado.id}`)
    }
  }

  const handleTicketEvent = data => {
    const { action, ticket, ticketId } = data

    switch (action) {
      case 'update':
        store.updateTicket(ticket)
        break
      case 'delete':
        store.deleteTicket(ticketId)
        break
      case 'updateUnread':
        store.resetUnread({ ticketId })
        break
      default:
        break
    }
  }

  const handleMessageEvent = data => {
    const { action, message, ticket } = data

    if (action === 'create') {
      store.updateTicket(ticket)

      const ticketFocado = store.ticketFocado
      if (
        ticketFocado?.id !== ticket.id && 
        ticket.status !== 'closed' && 
        !message.fromMe && 
        !ticket.chatFlowId
      ) {
        window.dispatchEvent(
          new CustomEvent('handlerNotifications', { detail: message })
        )
      }
    }
  }

  const emitEvent = (event, data) => {
    if (!socket.value || !isConnected.value) {
      notification.notifyError('Não conectado ao servidor')
      return
    }

    socket.value.emit(event, data)
  }

  // Lifecycle
  onMounted(() => {
    connect()
  })

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    // Estado
    isConnected,
    lastEvent,
    lastError,

    // Métodos
    connect,
    disconnect,
    emitEvent
  }
}
