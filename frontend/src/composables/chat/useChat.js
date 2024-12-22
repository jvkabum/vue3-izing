import { ref } from 'vue'
import request from 'src/service/request'
import { useQuasar } from 'quasar'

export function useChat() {
  const $q = useQuasar()
  const messages = ref([])
  const loading = ref(false)
  const error = ref(null)

  const sendMessage = async (message) => {
    loading.value = true
    try {
      let endpoint = '/messages'
      let method = 'post'
      let data = message

      // Se for um FormData (envio de arquivo), ajusta o endpoint
      if (message instanceof FormData) {
        endpoint = '/messages/media'
      }

      const response = await request({
        url: endpoint,
        method,
        data,
        headers: message instanceof FormData ? {
          'Content-Type': 'multipart/form-data'
        } : undefined
      })

      messages.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err?.data?.error || err.message
      $q.notify({
        type: 'negative',
        message: 'Erro ao enviar mensagem',
        position: 'top'
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadMessages = async (ticketId, page = 1) => {
    loading.value = true
    try {
      const { data } = await request({
        url: `/messages/${ticketId}`,
        method: 'get',
        params: { page }
      })
      messages.value = data
      return data
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMessage = async (messageId) => {
    loading.value = true
    try {
      await request({
        url: `/messages/${messageId}`,
        method: 'delete'
      })
      messages.value = messages.value.filter(m => m.id !== messageId)
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }, 100)
  }

  return {
    // Estado
    messages,
    loading,
    error,

    // Métodos
    sendMessage,
    loadMessages,
    deleteMessage,
    scrollToBottom
  }
}
