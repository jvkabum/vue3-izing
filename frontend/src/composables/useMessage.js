import { ref, computed } from 'vue'
import { api } from '@/services/api'

export function useMessage() {
  const message = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isMedia = computed(() => message.value?.mediaType)
  const isForwarded = computed(() => message.value?.forwardedFrom)
  const isQuoted = computed(() => message.value?.quotedMessageId)

  const fetchMessage = async (messageId) => {
    loading.value = true
    try {
      const { data } = await api.get(`/messages/${messageId}`)
      message.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const forwardMessage = async (messageId, ticketId) => {
    loading.value = true
    try {
      const { data } = await api.post(`/messages/${messageId}/forward`, {
        ticketId
      })
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMessage = async (messageId) => {
    loading.value = true
    try {
      await api.delete(`/messages/${messageId}`)
      message.value = null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    message,
    loading,
    error,
    isMedia,
    isForwarded,
    isQuoted,
    fetchMessage,
    forwardMessage,
    deleteMessage
  }
} 