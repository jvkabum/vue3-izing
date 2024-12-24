import { ref } from 'vue'
import { api } from '@/services/api'

export function useTemplates() {
  const templates = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchTemplates = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/message-templates')
      templates.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTemplate = async (template) => {
    loading.value = true
    try {
      const { data } = await api.post('/message-templates', template)
      templates.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTemplate = async (id, template) => {
    loading.value = true
    try {
      const { data } = await api.put(`/message-templates/${id}`, template)
      const index = templates.value.findIndex(t => t.id === id)
      if (index !== -1) {
        templates.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTemplate = async (id) => {
    loading.value = true
    try {
      await api.delete(`/message-templates/${id}`)
      templates.value = templates.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
} 