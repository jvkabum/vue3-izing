import { ref, computed } from 'vue'
import request from 'src/service/request'
import { useQuasar } from 'quasar'

export function useTickets() {
  const $q = useQuasar()
  const tickets = ref([])
  const currentTicket = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const ticketStatus = computed(() => currentTicket.value?.status || 'pending')
  const isTicketOpen = computed(() => ticketStatus.value === 'open')
  const isTicketPending = computed(() => ticketStatus.value === 'pending')
  const isTicketClosed = computed(() => ticketStatus.value === 'closed')

  // Métodos
  const loadTickets = async (params = {}) => {
    loading.value = true
    try {
      const { data } = await request({
        url: '/tickets',
        method: 'get',
        params
      })
      tickets.value = data
      return data
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTicketById = async (ticketId) => {
    loading.value = true
    try {
      const { data } = await request({
        url: `/tickets/${ticketId}`,
        method: 'get'
      })
      currentTicket.value = data
      return data
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const startTicket = async () => {
    if (!currentTicket.value?.id) {
      throw new Error('Nenhum ticket selecionado')
    }

    loading.value = true
    try {
      const { data } = await request({
        url: `/tickets/${currentTicket.value.id}/start`,
        method: 'put'
      })
      currentTicket.value = data
      $q.notify({
        type: 'positive',
        message: 'Atendimento iniciado com sucesso',
        position: 'top'
      })
      return data
    } catch (err) {
      error.value = err?.data?.error || err.message
      $q.notify({
        type: 'negative',
        message: 'Erro ao iniciar atendimento',
        position: 'top'
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  const closeTicket = async (ticketId, data = {}) => {
    loading.value = true
    try {
      const response = await request({
        url: `/tickets/${ticketId}/close`,
        method: 'put',
        data
      })
      if (currentTicket.value?.id === ticketId) {
        currentTicket.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTicket = async (ticketId, data) => {
    loading.value = true
    try {
      const response = await request({
        url: `/tickets/${ticketId}`,
        method: 'put',
        data
      })
      if (currentTicket.value?.id === ticketId) {
        currentTicket.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const transferTicket = async (ticketId, userId) => {
    loading.value = true
    try {
      const response = await request({
        url: `/tickets/${ticketId}/transfer`,
        method: 'put',
        data: { userId }
      })
      if (currentTicket.value?.id === ticketId) {
        currentTicket.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err?.data?.error || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    tickets,
    currentTicket,
    loading,
    error,

    // Computed
    ticketStatus,
    isTicketOpen,
    isTicketPending,
    isTicketClosed,

    // Métodos
    loadTickets,
    getTicketById,
    startTicket,
    closeTicket,
    updateTicket,
    transferTicket
  }
}
