import { ref } from 'vue'
import { api } from '@/services/api'

export function useContactLists() {
  const lists = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchLists = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/contact-lists')
      lists.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createList = async (listData) => {
    loading.value = true
    try {
      const { data } = await api.post('/contact-lists', listData)
      lists.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateList = async (id, listData) => {
    loading.value = true
    try {
      const { data } = await api.put(`/contact-lists/${id}`, listData)
      const index = lists.value.findIndex(l => l.id === id)
      if (index !== -1) {
        lists.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteList = async (id) => {
    loading.value = true
    try {
      await api.delete(`/contact-lists/${id}`)
      lists.value = lists.value.filter(l => l.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addContactsToList = async (listId, contactIds) => {
    loading.value = true
    try {
      const { data } = await api.post(`/contact-lists/${listId}/contacts`, {
        contactIds
      })
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeContactFromList = async (listId, contactId) => {
    loading.value = true
    try {
      await api.delete(`/contact-lists/${listId}/contacts/${contactId}`)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    lists,
    loading,
    error,
    fetchLists,
    createList,
    updateList,
    deleteList,
    addContactsToList,
    removeContactFromList
  }
} 