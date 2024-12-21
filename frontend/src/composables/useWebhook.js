import { ref } from 'vue'
import { api } from '@/services/api'

export function useWebhook() {
  const webhooks = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchWebhooks = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/webhooks')
      webhooks.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createWebhook = async (webhook) => {
    loading.value = true
    try {
      const { data } = await api.post('/webhooks', webhook)
      webhooks.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWebhook = async (id, webhook) => {
    loading.value = true
    try {
      const { data } = await api.put(`/webhooks/${id}`, webhook)
      const index = webhooks.value.findIndex(w => w.id === id)
      if (index !== -1) {
        webhooks.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWebhook = async (id) => {
    loading.value = true
    try {
      await api.delete(`/webhooks/${id}`)
      webhooks.value = webhooks.value.filter(w => w.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const testWebhook = async (id) => {
    loading.value = true
    try {
      const { data } = await api.post(`/webhooks/${id}/test`)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    webhooks,
    loading,
    error,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook
  }
} 