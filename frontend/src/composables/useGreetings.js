import { ref } from 'vue'
import { api } from '@/services/api'

export function useGreetings() {
  const greetings = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchGreetings = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/greetings')
      greetings.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateGreeting = async (type, message) => {
    loading.value = true
    try {
      const { data } = await api.put(`/greetings/${type}`, { message })
      const index = greetings.value.findIndex(g => g.type === type)
      if (index !== -1) {
        greetings.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getGreetingByType = async (type) => {
    loading.value = true
    try {
      const { data } = await api.get(`/greetings/${type}`)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    greetings,
    loading,
    error,
    fetchGreetings,
    updateGreeting,
    getGreetingByType
  }
} 