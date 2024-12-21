import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { useMessageFormatter } from './useMessageFormatter'
import { format } from 'date-fns'

export function useChat() {
  // Composables
  const router = useRouter()
  const $q = useQuasar()
  const { socket } = useSocket()
  const { formatWhatsAppMessage } = useMessageFormatter()

  // Estado
  const messages = ref([])
  const hasMore = ref(true)
  const loading = ref(false)
  const error = ref(null)
  const currentTicket = ref(null)
  const replyingTo = ref(null)
  const scheduledMessages = ref([])

  // Computed
  const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) => {
      const dateA = new Date(a.timestamp || a.createdAt)
      const dateB = new Date(b.timestamp || b.createdAt)
      return dateA - dateB
    })
  })

  const unreadCount = computed(() => 
    messages.value.filter(m => !m.read).length
  )

  // Métodos
  const loadMessages = async (ticketId, page = 1) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get(`/messages/${ticketId}`, {
        params: { pageNumber: page }
      })

      hasMore.value = data.hasMore

      if (page === 1) {
        messages.value = [...data.messages, ...data.messagesOffLine]
      } else {
        messages.value = [...data.messages, ...data.messagesOffLine, ...messages.value]
      }

      return data
    } catch (err) {
      error.value = 'Erro ao carregar mensagens'
      console.error('Erro ao carregar mensagens:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async (ticketId, message) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post(`/messages/${ticketId}`, message)
      
      // Adicionar mensagem localmente
      messages.value.push({
        ...data,
        status: 'pending',
        timestamp: new Date().toISOString()
      })

      return data
    } catch (err) {
      error.value = 'Erro ao enviar mensagem'
      console.error('Erro ao enviar mensagem:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`)
      
      const message = messages.value.find(m => m.id === messageId)
      if (message) {
        message.read = true
      }
    } catch (err) {
      console.error('Erro ao marcar mensagem como lida:', err)
      throw err
    }
  }

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`)
      messages.value = messages.value.filter(m => m.id !== messageId)
    } catch (err) {
      error.value = 'Erro ao deletar mensagem'
      console.error('Erro ao deletar mensagem:', err)
      throw err
    }
  }

  const scheduleMessage = async (ticketId, message) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post(`/messages/${ticketId}/schedule`, message)
      scheduledMessages.value.push(data)

      return data
    } catch (err) {
      error.value = 'Erro ao agendar mensagem'
      console.error('Erro ao agendar mensagem:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const forwardMessage = async (messageIds, contactId) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post('/messages/forward', {
        messageIds: Array.isArray(messageIds) ? messageIds : [messageIds],
        contactId
      })

      return data
    } catch (err) {
      error.value = 'Erro ao encaminhar mensagem'
      console.error('Erro ao encaminhar mensagem:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Socket handlers
  const handleNewMessage = (data) => {
    const { message, contact, ticket } = data

    // Notificação desktop
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
        router.push({ 
          name: 'chat',
          params: { ticketId: ticket.id }
        })
      }
    }

    // Atualizar mensagens se for o ticket atual
    if (currentTicket.value?.id === ticket.id) {
      messages.value.push(message)
    }
  }

  const handleMessageStatus = (data) => {
    const message = messages.value.find(m => m.id === data.id)
    if (message) {
      Object.assign(message, data)
    }
  }

  const handleMessageDelete = (messageId) => {
    messages.value = messages.value.filter(m => m.id !== messageId)
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('message', handleNewMessage)
    socket.value?.on('messageStatus', handleMessageStatus)
    socket.value?.on('messageDelete', handleMessageDelete)
  }

  const removeSocketListeners = () => {
    socket.value?.off('message', handleNewMessage)
    socket.value?.off('messageStatus', handleMessageStatus)
    socket.value?.off('messageDelete', handleMessageDelete)
  }

  // Lifecycle
  onMounted(() => {
    setupSocketListeners()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    messages: sortedMessages,
    hasMore,
    loading,
    error,
    currentTicket,
    replyingTo,
    scheduledMessages,
    unreadCount,

    // Métodos
    loadMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
    scheduleMessage,
    forwardMessage,
    
    // Helpers
    formatMessage: formatWhatsAppMessage
  }
}
