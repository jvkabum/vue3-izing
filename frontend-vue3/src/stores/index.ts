import { useUserStore } from './user.setup'
import { useWhatsAppStore } from './whatsapp'
import { useAtendimentoTicketStore } from './atendimentoTicket'
import { useNotificationsStore } from './notifications'
import { useChatFlowStore } from './chatFlow'
import { useUsersAppStore } from './usersApp'

// Exporta todas as stores Pinia
export {
  useUserStore,
  useWhatsAppStore,
  useAtendimentoTicketStore,
  useNotificationsStore,
  useChatFlowStore,
  useUsersAppStore
}

// Interface para o retorno da função initializeStores
interface Stores {
  user: ReturnType<typeof useUserStore>
  whatsApp: ReturnType<typeof useWhatsAppStore>
  atendimentoTicket: ReturnType<typeof useAtendimentoTicketStore>
  notifications: ReturnType<typeof useNotificationsStore>
  chatFlow: ReturnType<typeof useChatFlowStore>
  usersApp: ReturnType<typeof useUsersAppStore>
}

// Função para inicializar todas as stores
export function initializeStores(): Stores {
  return {
    user: useUserStore(),
    whatsApp: useWhatsAppStore(),
    atendimentoTicket: useAtendimentoTicketStore(),
    notifications: useNotificationsStore(),
    chatFlow: useChatFlowStore(),
    usersApp: useUsersAppStore()
  }
}
