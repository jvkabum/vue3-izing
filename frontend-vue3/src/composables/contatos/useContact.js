import { ref, computed } from 'vue'
import { api } from '@/services/api'

export function useContact() {
  const contact = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const tags = ref([])

  const hasWhatsapp = computed(() => contact.value?.number)
  const isBlocked = computed(() => contact.value?.isBlocked)

  const fetchContact = async (contactId) => {
    loading.value = true
    try {
      const { data } = await api.get(`/contacts/${contactId}`)
      contact.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateContact = async (contactId, contactData) => {
    loading.value = true
    try {
      const { data } = await api.put(`/contacts/${contactId}`, contactData)
      contact.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const blockContact = async (contactId) => {
    loading.value = true
    try {
      const { data } = await api.post(`/contacts/${contactId}/block`)
      contact.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchContactTags = async (contactId) => {
    loading.value = true
    try {
      const { data } = await api.get(`/contacts/${contactId}/tags`)
      tags.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    contact,
    tags,
    loading,
    error,
    hasWhatsapp,
    isBlocked,
    fetchContact,
    updateContact,
    blockContact,
    fetchContactTags
  }
} 