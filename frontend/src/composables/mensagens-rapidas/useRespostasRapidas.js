import { ref } from 'vue'
import { api } from '@/services/api'

export function useQuickAnswers() {
  const quickAnswers = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchQuickAnswers = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/quick-answers')
      quickAnswers.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createQuickAnswer = async (answer) => {
    loading.value = true
    try {
      const { data } = await api.post('/quick-answers', answer)
      quickAnswers.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateQuickAnswer = async (id, answer) => {
    loading.value = true
    try {
      const { data } = await api.put(`/quick-answers/${id}`, answer)
      const index = quickAnswers.value.findIndex(q => q.id === id)
      if (index !== -1) {
        quickAnswers.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteQuickAnswer = async (id) => {
    loading.value = true
    try {
      await api.delete(`/quick-answers/${id}`)
      quickAnswers.value = quickAnswers.value.filter(q => q.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    quickAnswers,
    loading,
    error,
    fetchQuickAnswers,
    createQuickAnswer,
    updateQuickAnswer,
    deleteQuickAnswer
  }
} 