import { ref } from 'vue'
import { api } from '@/services/api'

export function useTransfer() {
  const loading = ref(false)
  const error = ref(null)
  const selectedQueue = ref(null)
  const selectedUser = ref(null)

  const transferTicket = async (ticketId, transferData) => {
    if (!selectedQueue.value) {
      throw new Error('Selecione uma fila')
    }

    loading.value = true
    try {
      const { data } = await api.put(`/tickets/${ticketId}/transfer`, {
        userId: selectedUser.value?.id || null,
        queueId: selectedQueue.value.id,
        status: selectedUser.value ? 'open' : 'pending',
        ...transferData
      })

      return {
        success: true,
        message: 'Ticket transferido com sucesso',
        data
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const validateTransfer = (ticketUserId, ticketQueueId) => {
    if (selectedUser.value?.id === ticketUserId && ticketUserId) {
      return 'Ticket já pertence ao usuário selecionado'
    }

    if (selectedQueue.value?.id === ticketQueueId && selectedUser.value?.id === ticketUserId) {
      return 'Ticket já pertence a esta fila e usuário'
    }

    return null
  }

  const resetSelection = () => {
    selectedQueue.value = null
    selectedUser.value = null
  }

  return {
    loading,
    error,
    selectedQueue,
    selectedUser,
    transferTicket,
    validateTransfer,
    resetSelection
  }
} 