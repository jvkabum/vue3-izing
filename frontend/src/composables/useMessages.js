import { ref, onMounted } from 'vue'
import { api } from '@/services/api'

export function useMessages(ticketId) {
  const messages = ref([])
  const loading = ref(false)
  const hasMore = ref(true)
  const pageNumber = ref(1)

  const fetchMessages = async () => {
    if (loading.value || !hasMore.value) return

    try {
      loading.value = true
      const { data } = await api.get(`/messages/${ticketId}`, {
        params: {
          pageNumber: pageNumber.value
        }
      })
      
      messages.value = [...messages.value, ...data.messages]
      hasMore.value = data.hasMore
      pageNumber.value++
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async (message) => {
    try {
      loading.value = true
      await api.post(`/messages/${ticketId}`, message)
      await fetchMessages()
      return true
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchMessages)

  return {
    messages,
    loading,
    hasMore,
    fetchMessages,
    sendMessage
  }
} 