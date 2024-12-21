import { ref } from 'vue'
import { api } from '@/services/api'

export function useScheduledMessages() {
  const messages = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchScheduledMessages = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/scheduled-messages')
      messages.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const scheduleMessage = async (messageData) => {
    loading.value = true
    try {
      const { data } = await api.post('/scheduled-messages', messageData)
      messages.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelScheduledMessage = async (id) => {
    loading.value = true
    try {
      await api.delete(`/scheduled-messages/${id}`)
      messages.value = messages.value.filter(m => m.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    messages,
    loading,
    error,
    fetchScheduledMessages,
    scheduleMessage,
    cancelScheduledMessage
  }
} 