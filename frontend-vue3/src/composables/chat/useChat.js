import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAtendimentoTicketStore } from '../../stores'
import { EnviarMensagem } from '../../service/tickets'

/**
 * Composable para gerenciar o chat
 * @param {string} ticketId - ID do ticket atual
 * @returns {Object} Objeto contendo estados e métodos do chat
 */
export function useChat(ticketId) {
  const $q = useQuasar()
  const ticketStore = useAtendimentoTicketStore()

  // Estado
  const loading = ref(false)
  const hasMore = ref(true)
  const pageNumber = ref(1)

  /**
   * Mensagens do chat
   */
  const messages = computed(() => 
    ticketStore.getMensagens
  )

  /**
   * Carrega mais mensagens (paginação infinita)
   */
  const loadMoreMessages = async ($state) => {
    if (!hasMore.value || loading.value) {
      $state?.complete()
      return
    }

    try {
      loading.value = true
      
      await ticketStore.localizarMensagensTicket({
        ticketId,
        pageNumber: pageNumber.value
      })

      hasMore.value = ticketStore.getHasMore
      pageNumber.value++
      
      $state?.loaded()
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar mensagens',
        position: 'top'
      })
      $state?.error()
    } finally {
      loading.value = false
    }
  }

  /**
   * Envia uma nova mensagem
   * @param {Object} message - Dados da mensagem
   * @param {string} message.body - Conteúdo da mensagem
   * @param {string} [message.replyTo] - ID da mensagem sendo respondida
   * @param {File} [message.media] - Arquivo de mídia
   */
  const sendMessage = async (message) => {
    try {
      loading.value = true

      const data = {
        ticketId,
        body: message.body,
        quotedMsg: message.replyTo,
        media: message.media
      }

      await EnviarMensagem(data)

      // Atualiza lista de mensagens
      await loadMoreMessages()

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao enviar mensagem',
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Reseta o estado do chat
   */
  const resetChat = () => {
    hasMore.value = true
    pageNumber.value = 1
    ticketStore.resetMessage()
  }

  return {
    // Estado
    loading,
    hasMore,
    messages,
    
    // Métodos
    loadMoreMessages,
    sendMessage,
    resetChat
  }
}
