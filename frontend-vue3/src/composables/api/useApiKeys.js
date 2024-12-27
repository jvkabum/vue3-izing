import { ref } from 'vue'
import { api } from '@/services/api'

export function useApiKeys() {
  const apiKeys = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchApiKeys = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/api-keys')
      apiKeys.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createApiKey = async (name) => {
    loading.value = true
    try {
      const { data } = await api.post('/api-keys', { name })
      apiKeys.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const revokeApiKey = async (id) => {
    loading.value = true
    try {
      await api.delete(`/api-keys/${id}`)
      apiKeys.value = apiKeys.value.filter(k => k.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    apiKeys,
    loading,
    error,
    fetchApiKeys,
    createApiKey,
    revokeApiKey
  }
} 