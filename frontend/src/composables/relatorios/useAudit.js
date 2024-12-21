import { ref } from 'vue'
import { api } from '@/services/api'

export function useAudit() {
  const logs = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchLogs = async (params = {}) => {
    loading.value = true
    try {
      const { data } = await api.get('/audit-logs', { params })
      logs.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUserLogs = async (userId, params = {}) => {
    loading.value = true
    try {
      const { data } = await api.get(`/audit-logs/users/${userId}`, { params })
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTicketLogs = async (ticketId) => {
    loading.value = true
    try {
      const { data } = await api.get(`/audit-logs/tickets/${ticketId}`)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    logs,
    loading,
    error,
    fetchLogs,
    fetchUserLogs,
    fetchTicketLogs
  }
} 