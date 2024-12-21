import { ref } from 'vue'
import { api } from '@/services/api'

export function useQuickMessages() {
  const messages = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchMessages = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/quick-messages')
      messages.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMessage = async (messageData) => {
    loading.value = true
    try {
      const { data } = await api.post('/quick-messages', messageData)
      messages.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMessage = async (id, messageData) => {
    loading.value = true
    try {
      const { data } = await api.put(`/quick-messages/${id}`, messageData)
      const index = messages.value.findIndex(m => m.id === id)
      if (index !== -1) {
        messages.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMessage = async (id) => {
    loading.value = true
    try {
      await api.delete(`/quick-messages/${id}`)
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
    fetchMessages,
    createMessage,
    updateMessage,
    deleteMessage
  }
} 