import { ref, watch } from 'vue'
import { api } from '@/services/api'

export function useTicketStatus(ticketId) {
  const status = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchStatus = async () => {
    try {
      loading.value = true
      const { data } = await api.get(`/tickets/${ticketId}`)
      status.value = data.status
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateStatus = async (newStatus) => {
    try {
      loading.value = true
      await api.put(`/tickets/${ticketId}/status`, { status: newStatus })
      status.value = newStatus
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  watch(() => ticketId, fetchStatus, { immediate: true })

  return {
    status,
    loading,
    error,
    updateStatus
  }
} 