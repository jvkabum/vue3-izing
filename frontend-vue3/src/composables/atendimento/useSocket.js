import { ref, onMounted, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'
import { useStore } from 'src/stores'
import { useQuasar } from 'quasar'
import { useNotifications } from './useNotifications'

export function useSocket() {
  const store = useStore()
  const $q = useQuasar()
  const { notifyNewMessage } = useNotifications()

  const socket = ref(null)
  const connected = ref(false)
  const reconnecting = ref(false)

  const connect = () => {
    if (socket.value?.connected) return

    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (!usuario?.tenantId) return

    socket.value = io(process.env.VUE_APP_API_URL, {
      query: {
        tenantId: usuario.tenantId,
        userId: usuario.userId
      }
    })

    setupSocketListeners()
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  const setupSocketListeners = () => {
    if (!socket.value) return

    socket.value.on('connect', () => {
      connected.value = true
      reconnecting.value = false
      console.log('Socket conectado')
    })

    socket.value.on('disconnect', () => {
      connected.value = false
      console.log('Socket desconectado')
    })

    socket.value.on('reconnecting', () => {
      reconnecting.value = true
      console.log('Socket reconectando...')
    })

    socket.value.on('error', (error) => {
      console.error('Erro no socket:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro na conexão com o servidor',
        caption: error.message
      })
    })

    // Eventos específicos do atendimento
    socket.value.on('appMessage', (data) => {
      if (data.action === 'create') {
        handleNewMessage(data)
      }
      if (data.action === 'update') {
        handleMessageUpdate(data)
      }
      if (data.action === 'delete') {
        handleMessageDelete(data)
      }
    })

    socket.value.on('ticket', (data) => {
      if (data.action === 'update') {
        handleTicketUpdate(data)
      }
      if (data.action === 'delete') {
        handleTicketDelete(data)
      }
    })
  }

  const handleNewMessage = (data) => {
    store.commit('ADD_MESSAGE', data.message)
    
    // Notificar apenas mensagens de clientes
    if (!data.message.fromMe && !data.message.read) {
      notifyNewMessage(data.message)
    }
  }

  const handleMessageUpdate = (data) => {
    store.commit('UPDATE_MESSAGE', data.message)
  }

  const handleMessageDelete = (data) => {
    store.commit('DELETE_MESSAGE', data.messageId)
  }

  const handleTicketUpdate = (data) => {
    store.commit('UPDATE_TICKET', data.ticket)
  }

  const handleTicketDelete = (data) => {
    store.commit('DELETE_TICKET', data.ticketId)
  }

  const joinTicketRoom = (ticketId) => {
    if (!socket.value?.connected || !ticketId) return
    
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    socket.value.emit('joinTicket', {
      ticketId,
      tenantId: usuario.tenantId
    })
  }

  const leaveTicketRoom = (ticketId) => {
    if (!socket.value?.connected || !ticketId) return
    
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    socket.value.emit('leaveTicket', {
      ticketId,
      tenantId: usuario.tenantId
    })
  }

  onMounted(() => {
    connect()
  })

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    socket,
    connected,
    reconnecting,
    connect,
    disconnect,
    joinTicketRoom,
    leaveTicketRoom
  }
}
