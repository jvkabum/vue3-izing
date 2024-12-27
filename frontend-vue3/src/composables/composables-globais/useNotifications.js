import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { useSocket } from './useSocket'

export function useNotifications() {
  const $q = useQuasar()
  const store = useStore()
  const { socket } = useSocket()
  
  const notifications = ref([])
  const sound = ref(null)
  
  const initSound = () => {
    sound.value = new Audio('/notification.mp3')
  }

  const playNotificationSound = () => {
    if (sound.value) {
      sound.value.play().catch(error => {
        console.error('Erro ao tocar som:', error)
      })
    }
  }

  const showNotification = ({ title, message, type = 'info', timeout = 5000 }) => {
    $q.notify({
      type,
      message,
      caption: title,
      progress: true,
      position: 'top-right',
      timeout,
      actions: [{ icon: 'close', round: true, color: 'white' }]
    })

    if (type === 'warning' || type === 'negative') {
      playNotificationSound()
    }
  }

  const handleNewTicket = (data) => {
    showNotification({
      title: 'Novo Ticket',
      message: `Novo ticket recebido de ${data.contact?.name || 'Cliente'}`,
      type: 'positive'
    })
    store.commit('ADD_TICKET', data)
  }

  const handleNewMessage = (data) => {
    if (!data.fromMe) {
      showNotification({
        title: 'Nova Mensagem',
        message: `Nova mensagem de ${data.contact?.name || 'Cliente'}`,
        type: 'info'
      })
    }
    store.commit('ADD_MESSAGE', data)
  }

  const handleTicketUpdate = (data) => {
    showNotification({
      title: 'Ticket Atualizado',
      message: `Status do ticket alterado para ${data.status}`,
      type: 'warning'
    })
    store.commit('UPDATE_TICKET', data)
  }

  const setupSocketListeners = () => {
    if (socket) {
      socket.on('newTicket', handleNewTicket)
      socket.on('newMessage', handleNewMessage)
      socket.on('ticketUpdate', handleTicketUpdate)
    }
  }

  const removeSocketListeners = () => {
    if (socket) {
      socket.off('newTicket', handleNewTicket)
      socket.off('newMessage', handleNewMessage)
      socket.off('ticketUpdate', handleTicketUpdate)
    }
  }

  const init = () => {
    initSound()
    setupSocketListeners()
  }

  const cleanup = () => {
    removeSocketListeners()
    sound.value = null
  }

  return {
    notifications,
    showNotification,
    init,
    cleanup
  }
}
