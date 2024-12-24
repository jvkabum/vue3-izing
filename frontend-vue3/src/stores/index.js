// Exporta todas as stores Pinia
export { useUserStore } from './user'
export { useWhatsAppStore } from './whatsapp'
export { useAtendimentoTicketStore } from './atendimentoTicket'
export { useNotificationsStore } from './notifications'
export { useChatFlowStore } from './chatFlow'
export { useUsersAppStore } from './usersApp'

// Função para inicializar todas as stores
export function initializeStores() {
  // As stores são inicializadas automaticamente quando importadas
  // Esta função pode ser usada para qualquer inicialização adicional necessária
  return {
    user: useUserStore(),
    whatsApp: useWhatsAppStore(),
    atendimentoTicket: useAtendimentoTicketStore(),
    notifications: useNotificationsStore(),
    chatFlow: useChatFlowStore(),
    usersApp: useUsersAppStore()
  }
}
