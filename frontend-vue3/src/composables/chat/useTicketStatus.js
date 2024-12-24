import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAtendimentoTicketStore } from '../../stores'
import { AtualizarStatusTicket } from '../../service/tickets'

/**
 * Composable para gerenciar o status do ticket
 * @param {string} ticketId - ID do ticket
 * @returns {Object} Objeto contendo estados e métodos do status
 */
export function useTicketStatus(ticketId) {
  const $q = useQuasar()
  const ticketStore = useAtendimentoTicketStore()
  
  // Estado
  const updating = ref(false)

  /**
   * Status possíveis do ticket
   */
  const STATUS = {
    OPEN: 'open',
    PENDING: 'pending',
    CLOSED: 'closed'
  }

  /**
   * Mensagens de feedback para cada status
   */
  const STATUS_MESSAGES = {
    [STATUS.OPEN]: 'Ticket reaberto com sucesso',
    [STATUS.PENDING]: 'Ticket retornado para pendente',
    [STATUS.CLOSED]: 'Ticket resolvido com sucesso'
  }

  /**
   * Atualiza o status do ticket
   * @param {string} status - Novo status (open, pending, closed)
   */
  const updateStatus = async (status) => {
    if (updating.value || !Object.values(STATUS).includes(status)) return

    try {
      updating.value = true

      await AtualizarStatusTicket({
        ticketId,
        status
      })

      // Atualiza store
      ticketStore.updateTicket({
        id: ticketId,
        status
      })

      // Feedback visual
      $q.notify({
        type: 'positive',
        message: STATUS_MESSAGES[status] || 'Status atualizado com sucesso',
        position: 'top',
        timeout: 2000,
        actions: [
          { 
            label: 'Desfazer', 
            color: 'white',
            handler: () => {
              // Lógica para desfazer a ação
              const previousStatus = status === STATUS.CLOSED ? STATUS.OPEN : STATUS.PENDING
              updateStatus(previousStatus)
            }
          }
        ]
      })

    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar status do ticket',
        position: 'top',
        timeout: 5000,
        caption: error.message
      })
      throw error
    } finally {
      updating.value = false
    }
  }

  /**
   * Verifica se um status é válido
   * @param {string} status - Status a ser verificado
   * @returns {boolean}
   */
  const isValidStatus = (status) => {
    return Object.values(STATUS).includes(status)
  }

  return {
    // Estado
    updating,
    STATUS,
    
    // Métodos
    updateStatus,
    isValidStatus
  }
}
