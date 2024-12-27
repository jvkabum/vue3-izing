import { ref } from 'vue'
import { api } from '@/services/api'

export function useBlacklist() {
  const blacklist = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchBlacklist = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/blacklist')
      blacklist.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addToBlacklist = async (number, reason = '') => {
    loading.value = true
    try {
      const { data } = await api.post('/blacklist', { number, reason })
      blacklist.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeFromBlacklist = async (number) => {
    loading.value = true
    try {
      await api.delete(`/blacklist/${number}`)
      blacklist.value = blacklist.value.filter(b => b.number !== number)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const checkBlacklist = async (number) => {
    try {
      const { data } = await api.get(`/blacklist/check/${number}`)
      return data.blocked
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  return {
    blacklist,
    loading,
    error,
    fetchBlacklist,
    addToBlacklist,
    removeFromBlacklist,
    checkBlacklist
  }
} 