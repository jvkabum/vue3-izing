import { computed } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Composable para gerenciar o cabeçalho do chat
 * @param {Object} ticket - Ticket atual
 * @returns {Object} Objeto contendo estados e métodos do cabeçalho
 */
export function useChatHeader(ticket) {
  const $q = useQuasar()

  /**
   * Status possíveis do ticket
   */
  const STATUS = {
    OPEN: 'open',
    PENDING: 'pending',
    CLOSED: 'closed'
  }

  /**
   * Informações do contato
   */
  const contactInfo = computed(() => ({
    name: ticket.value?.contact?.name || 'Sem nome',
    number: ticket.value?.contact?.number || 'Sem número',
    profilePicUrl: ticket.value?.contact?.profilePicUrl || '/img/default-avatar.png'
  }))

  /**
   * Ações disponíveis baseadas no status
   */
  const availableActions = computed(() => {
    const status = ticket.value?.status

    return {
      canResolve: status === STATUS.OPEN,
      canReopen: status === STATUS.CLOSED,
      canReturn: status === STATUS.OPEN,
      canSchedule: status !== STATUS.CLOSED
    }
  })

  /**
   * Copia o número do contato
   */
  const copyContactNumber = () => {
    const number = contactInfo.value.number
    navigator.clipboard.writeText(number)
    
    $q.notify({
      type: 'positive',
      message: 'Número copiado!',
      position: 'top',
      timeout: 2000
    })
  }

  /**
   * Abre perfil do contato
   */
  const openContactProfile = () => {
    // Implementar lógica para abrir perfil
  }

  return {
    // Estado
    contactInfo,
    availableActions,
    STATUS,
    
    // Métodos
    copyContactNumber,
    openContactProfile
  }
}
