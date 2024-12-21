import { ref } from 'vue'
import { api } from '@/services/api'

export function useRatings() {
  const ratings = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchRatings = async (params = {}) => {
    loading.value = true
    try {
      const { data } = await api.get('/ratings', { params })
      ratings.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createRating = async (ticketId, ratingData) => {
    loading.value = true
    try {
      const { data } = await api.post(`/ratings/${ticketId}`, ratingData)
      ratings.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getRatingStats = async (params = {}) => {
    loading.value = true
    try {
      const { data } = await api.get('/ratings/stats', { params })
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    ratings,
    loading,
    error,
    fetchRatings,
    createRating,
    getRatingStats
  }
} 