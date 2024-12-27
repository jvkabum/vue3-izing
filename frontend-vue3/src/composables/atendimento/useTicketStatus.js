import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { AtualizarStatusTicket } from 'src/service/tickets'

export function useTicketStatus() {
  const $q = useQuasar()
  const store = useStore()
  const loading = ref(false)
  
  const statusAbreviado = {
    open: 'A',
    pending: 'P',
    closed: 'R'
  }

  const status = {
    open: 'Aberto',
    pending: 'Pendente',
    closed: 'Resolvido'
  }

  const color = {
    open: 'primary',
    pending: 'negative',
    closed: 'positive'
  }

  const borderColor = {
    open: 'primary',
    pending: 'negative',
    closed: 'positive'
  }

  const iniciarAtendimento = async (ticket) => {
    loading.value = true
    try {
      await AtualizarStatusTicket({
        ticketId: ticket.id,
        status: 'open',
        userId: localStorage.getItem('userId')
      })

      $q.notify({
        type: 'positive',
        message: 'Atendimento iniciado com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      store.commit('UPDATE_TICKET', {
        ...ticket,
        status: 'open',
        userId: localStorage.getItem('userId')
      })
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao iniciar atendimento',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const resolverAtendimento = async (ticket) => {
    loading.value = true
    try {
      await AtualizarStatusTicket({
        ticketId: ticket.id,
        status: 'closed'
      })

      $q.notify({
        type: 'positive',
        message: 'Atendimento resolvido com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      store.commit('UPDATE_TICKET', {
        ...ticket,
        status: 'closed'
      })
    } catch (error) {
      console.error('Erro ao resolver atendimento:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao resolver atendimento',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const retornarAtendimento = async (ticket) => {
    loading.value = true
    try {
      await AtualizarStatusTicket({
        ticketId: ticket.id,
        status: 'pending',
        userId: null
      })

      $q.notify({
        type: 'positive',
        message: 'Atendimento retornado para fila com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      store.commit('UPDATE_TICKET', {
        ...ticket,
        status: 'pending',
        userId: null
      })
    } catch (error) {
      console.error('Erro ao retornar atendimento:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao retornar atendimento',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const reabrirAtendimento = async (ticket) => {
    loading.value = true
    try {
      await AtualizarStatusTicket({
        ticketId: ticket.id,
        status: 'open',
        userId: localStorage.getItem('userId')
      })

      $q.notify({
        type: 'positive',
        message: 'Atendimento reaberto com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      store.commit('UPDATE_TICKET', {
        ...ticket,
        status: 'open',
        userId: localStorage.getItem('userId')
      })
    } catch (error) {
      console.error('Erro ao reabrir atendimento:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao reabrir atendimento',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const espiarAtendimento = async (ticket) => {
    store.commit('SET_TICKET_FOCADO', ticket)
  }

  return {
    loading,
    statusAbreviado,
    status,
    color,
    borderColor,
    iniciarAtendimento,
    resolverAtendimento,
    retornarAtendimento,
    reabrirAtendimento,
    espiarAtendimento
  }
}
