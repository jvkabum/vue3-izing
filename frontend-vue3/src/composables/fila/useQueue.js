import { ref, computed } from 'vue'
import { api } from '@/services/api'

export function useQueue() {
  const queue = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const messages = ref([])

  const isActive = computed(() => queue.value?.active)
  const isDefault = computed(() => queue.value?.isDefault)

  const fetchQueue = async (queueId) => {
    loading.value = true
    try {
      const { data } = await api.get(`/queues/${queueId}`)
      queue.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchQueueMessages = async (queueId) => {
    loading.value = true
    try {
      const { data } = await api.get(`/queues/${queueId}/messages`)
      messages.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateQueueSettings = async (queueId, settings) => {
    loading.value = true
    try {
      const { data } = await api.put(`/queues/${queueId}/settings`, settings)
      queue.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    queue,
    messages,
    loading,
    error,
    isActive,
    isDefault,
    fetchQueue,
    fetchQueueMessages,
    updateQueueSettings
  }
} 