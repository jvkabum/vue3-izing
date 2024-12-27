import { useRouter } from 'vue-router'
import { useAtendimentoStore } from 'src/stores/atendimento'
import { useAtendimentoNotification } from './useAtendimentoNotification'

export function useHeaderActions() {
  const router = useRouter()
  const atendimentoStore = useAtendimentoStore()
  const notification = useAtendimentoNotification()

  const handleReopen = async ticket => {
    try {
      await atendimentoStore.updateTicketStatus(ticket.id, 'open')
      notification.notifySuccess('Ticket reaberto com sucesso')
    } catch {
      notification.notifyError('Erro ao reabrir ticket')
    }
  }

  const handleReturn = async ticket => {
    try {
      await atendimentoStore.updateTicketStatus(ticket.id, 'pending')
      notification.notifySuccess('Ticket retornado para a fila')
    } catch {
      notification.notifyError('Erro ao retornar ticket para a fila')
    }
  }

  const handleResolve = async ticket => {
    try {
      await atendimentoStore.updateTicketStatus(ticket.id, 'closed')
      notification.notifySuccess('Ticket resolvido com sucesso')
    } catch {
      notification.notifyError('Erro ao resolver ticket')
    }
  }

  const handleSchedule = () => {
    router.push({ 
      name: 'agendamento',
      params: { 
        ticketId: atendimentoStore.ticketFocado?.id 
      }
    })
  }

  const handleMenuClick = () => {
    window.dispatchEvent(new CustomEvent('infor-cabecalo-chat:acao-menu'))
  }

  const handleContactInfoClick = () => {
    window.dispatchEvent(new CustomEvent('infor-cabecalo-chat:acao-contato'))
  }

  return {
    handleReopen,
    handleReturn,
    handleResolve,
    handleSchedule,
    handleMenuClick,
    handleContactInfoClick
  }
}
