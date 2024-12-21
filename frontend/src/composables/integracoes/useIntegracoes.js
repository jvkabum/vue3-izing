import { ref } from 'vue'
import { api } from '@/services/api'

export function useIntegrations() {
  const integrations = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchIntegrations = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/integrations')
      integrations.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const connectIntegration = async (type, credentials) => {
    loading.value = true
    try {
      const { data } = await api.post(`/integrations/${type}/connect`, credentials)
      const index = integrations.value.findIndex(i => i.type === type)
      if (index !== -1) {
        integrations.value[index] = data
      } else {
        integrations.value.push(data)
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const disconnectIntegration = async (type) => {
    loading.value = true
    try {
      await api.post(`/integrations/${type}/disconnect`)
      integrations.value = integrations.value.filter(i => i.type !== type)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    integrations,
    loading,
    error,
    fetchIntegrations,
    connectIntegration,
    disconnectIntegration
  }
} 