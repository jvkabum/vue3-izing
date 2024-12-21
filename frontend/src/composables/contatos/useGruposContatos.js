import { ref } from 'vue'
import { api } from '@/services/api'

export function useContactGroups() {
  const groups = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchGroups = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/contact-groups')
      groups.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createGroup = async (groupData) => {
    loading.value = true
    try {
      const { data } = await api.post('/contact-groups', groupData)
      groups.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateGroup = async (id, groupData) => {
    loading.value = true
    try {
      const { data } = await api.put(`/contact-groups/${id}`, groupData)
      const index = groups.value.findIndex(g => g.id === id)
      if (index !== -1) {
        groups.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteGroup = async (id) => {
    loading.value = true
    try {
      await api.delete(`/contact-groups/${id}`)
      groups.value = groups.value.filter(g => g.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup
  }
} 