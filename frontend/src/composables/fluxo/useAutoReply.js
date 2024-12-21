import { ref } from 'vue'
import { api } from '@/services/api'

export function useAutoReply() {
  const autoReplies = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchAutoReplies = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/auto-replies')
      autoReplies.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAutoReply = async (autoReplyData) => {
    loading.value = true
    try {
      const { data } = await api.post('/auto-replies', autoReplyData)
      autoReplies.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAutoReply = async (id, autoReplyData) => {
    loading.value = true
    try {
      const { data } = await api.put(`/auto-replies/${id}`, autoReplyData)
      const index = autoReplies.value.findIndex(ar => ar.id === id)
      if (index !== -1) {
        autoReplies.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAutoReply = async (id) => {
    loading.value = true
    try {
      await api.delete(`/auto-replies/${id}`)
      autoReplies.value = autoReplies.value.filter(ar => ar.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    autoReplies,
    loading,
    error,
    fetchAutoReplies,
    createAutoReply,
    updateAutoReply,
    deleteAutoReply
  }
} 