import { ref, onMounted, onUnmounted } from 'vue'
import { socketIO } from '../../utils/socket'
import { useAtendimentoTicketStore } from '../../stores'

/**
 * Composable para gerenciar conexão socket do chat
 * @param {string} ticketId - ID do ticket
 * @returns {Object} Objeto contendo socket e métodos
 */
export function useSocketChat(ticketId) {
  const socket = socketIO()
  const ticketStore = useAtendimentoTicketStore()
  
  // Estado
  const isConnected = ref(false)
  const lastError = ref(null)

  /**
   * Manipula novas mensagens recebidas
   * @param {Object} data - Dados da mensagem
   */
  const handleNewMessage = (data) => {
    if (data.action === 'create') {
      ticketStore.updateMessages({
        ...data.message,
        ticket: data.ticket
      })
    }
  }

  /**
   * Manipula atualizações de status do ticket
   * @param {Object} data - Dados da atualização
   */
  const handleStatusUpdate = (data) => {
    if (data.action === 'update') {
      ticketStore.updateTicket(data.ticket)
    }
  }

  /**
   * Manipula atualizações de digitação
   * @param {Object} data - Dados da digitação
   */
  const handleTyping = (data) => {
    // Implementar lógica de "digitando..."
    console.log('Typing:', data)
  }

  /**
   * Manipula erros de conexão
   * @param {Error} error - Erro ocorrido
   */
  const handleError = (error) => {
    console.error('Socket error:', error)
    lastError.value = error
    isConnected.value = false
  }

  /**
   * Envia evento de digitação
   * @param {boolean} isTyping - Se está digitando ou não
   */
  const sendTyping = (isTyping = true) => {
    if (!isConnected.value) return

    socket.emit('typing', {
      ticketId,
      isTyping
    })
  }

  /**
   * Reconecta o socket
   */
  const reconnect = () => {
    if (isConnected.value) return
    
    socket.connect()
    joinChat()
  }

  /**
   * Entra na sala do chat
   */
  const joinChat = () => {
    if (!ticketId) return
    
    socket.emit('joinChatBox', ticketId)
    isConnected.value = true
    lastError.value = null
  }

  /**
   * Sai da sala do chat
   */
  const leaveChat = () => {
    if (!ticketId) return
    
    socket.emit('leaveChatBox', ticketId)
    isConnected.value = false
  }

  // Lifecycle
  onMounted(() => {
    // Registra listeners
    socket.on('connect', joinChat)
    socket.on('disconnect', () => isConnected.value = false)
    socket.on('error', handleError)
    socket.on('appMessage', handleNewMessage)
    socket.on('ticket', handleStatusUpdate)
    socket.on('typing', handleTyping)

    // Conecta ao entrar
    joinChat()
  })

  onUnmounted(() => {
    // Remove listeners
    socket.off('connect', joinChat)
    socket.off('disconnect')
    socket.off('error', handleError)
    socket.off('appMessage', handleNewMessage)
    socket.off('ticket', handleStatusUpdate)
    socket.off('typing', handleTyping)

    // Desconecta ao sair
    leaveChat()
  })

  return {
    // Estado
    socket,
    isConnected,
    lastError,
    
    // Métodos
    sendTyping,
    reconnect,
    joinChat,
    leaveChat
  }
}
