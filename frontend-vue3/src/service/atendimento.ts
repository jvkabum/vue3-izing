import { api } from 'src/boot/axios'

interface ServiceResponse<T> {
  data: T
  status: number
  statusText: string
}

interface Ticket {
  id: number
  status: string
  userId?: number
  contactId?: number
  messages?: any[]
}

interface Message {
  id: number
  ticketId: number
  body: string
  read: boolean
  mediaUrl?: string
  mediaType?: string
}

interface MessagesResponse {
  messages: Message[]
  ticket: Ticket
  count: number
  hasMore: boolean
}

interface TicketsResponse {
  tickets: Ticket[]
  count: number
  hasMore: boolean
}

export const AtendimentoService = {
  async consultarMensagens(ticketId: number): Promise<ServiceResponse<MessagesResponse>> {
    return await api.get(`/messages/${ticketId}`)
  },

  async consultarTickets(params: any): Promise<ServiceResponse<TicketsResponse>> {
    return await api.get('/tickets', { params })
  },

  async atualizarStatusTicket(ticketId: number, status: string, userId?: number): Promise<ServiceResponse<Ticket>> {
    return await api.put(`/tickets/${ticketId}`, {
      status,
      userId
    })
  },

  async deletarMensagem(messageId: number): Promise<ServiceResponse<Message>> {
    return await api.delete(`/messages/${messageId}`)
  },

  async enviarMensagem(ticketId: number, data: any): Promise<ServiceResponse<Message>> {
    return await api.post(`/messages/${ticketId}`, data)
  },

  async transferirTicket(ticketId: number, userId: number, queueId?: number): Promise<ServiceResponse<Ticket>> {
    return await api.put(`/tickets/${ticketId}/transfer`, {
      userId,
      queueId
    })
  },

  async consultarLogsTicket(ticketId: number): Promise<ServiceResponse<any>> {
    return await api.get(`/tickets/${ticketId}/logs`)
  },

  async agendarMensagem(ticketId: number, data: any): Promise<ServiceResponse<any>> {
    return await api.post(`/messages/${ticketId}/schedule`, data)
  },

  async cancelarAgendamento(scheduleId: number): Promise<ServiceResponse<any>> {
    return await api.delete(`/messages/schedule/${scheduleId}`)
  }
}

export default AtendimentoService
