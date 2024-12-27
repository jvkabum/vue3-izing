import { ref, onMounted, onUnmounted } from 'vue'
import { useSocket } from './useSocket'
import { useStore } from 'vuex'
import { format } from 'date-fns'

export function useSocketEvents() {
  const store = useStore()
  const { socket } = useSocket()
  const audioNotification = ref(null)

  const socketTicketList = () => {
    if (!socket.value) return

    socket.value.on('ticket', data => {
      if (data.action === 'update') {
        store.commit('UPDATE_TICKET', data.ticket)
      } else if (data.action === 'create') {
        store.commit('ADD_TICKET', data.ticket)
      } else if (data.action === 'delete') {
        store.commit('DELETE_TICKET', data.ticketId)
      } else if (data.action === 'reload') {
        store.dispatch('RecarregarTickets')
      }
    })

    socket.value.on('appMessage', data => {
      store.commit('ADD_MESSAGE_TICKET', data)
    })

    socket.value.on('contact', data => {
      if (data.action === 'update') {
        store.commit('UPDATE_CONTACT', data.contact)
      }
    })
  }

  const handlerNotifications = (data) => {
    const { message, contact, ticket } = data

    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(
        `Mensagem de ${contact.name}`,
        {
          body: `${message.body} - ${format(new Date(), 'HH:mm')}`,
          icon: contact.profilePicUrl,
          tag: ticket.id,
          renotify: true
        }
      )

      notification.onclick = () => {
        window.focus()
        store.dispatch('AbrirChatMensagens', ticket)
        router.push({ name: 'atendimento' })
      }

      if (audioNotification.value) {
        audioNotification.value.play()
      }
    }
  }

  onMounted(() => {
    socketTicketList()
    if ('Notification' in window) {
      Notification.requestPermission()
    }
  })

  onUnmounted(() => {
    if (socket.value) {
      socket.value.off('ticket')
      socket.value.off('appMessage')
      socket.value.off('contact')
    }
  })

  return {
    socketTicketList,
    handlerNotifications,
    audioNotification
  }
}
