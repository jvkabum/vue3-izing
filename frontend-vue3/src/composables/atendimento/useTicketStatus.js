import { ref } from 'vue'
import { useAtendimentoTicketStore } from '../../stores'
import { AtualizarStatusTicket } from '../../service/tickets'

export function useTicketStatus() {
  const ticketStore = useAtendimentoTicketStore()
  
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

  const iniciarAtendimento = async (ticket) => {
    try {
      const data = {
        ticketId: ticket.id,
        status: 'open'
      }
      await AtualizarStatusTicket(data)
      ticketStore.updateTicket({
        ...ticket,
        status: 'open'
      })
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error)
    }
  }

  return {
    statusAbreviado,
    status,
    color,
    iniciarAtendimento
  }
}
