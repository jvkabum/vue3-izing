import { api } from './api'

export async function EnviarMensagemTexto(ticketId, data) {
  return api.post(`/tickets/${ticketId}/messages`, data)
}

export async function ListarTickets(params) {
  return api.get('/tickets', { params })
}

export async function BuscarTicket(id) {
  return api.get(`/tickets/${id}`)
}

export async function ListarMensagens(ticketId, params) {
  return api.get(`/tickets/${ticketId}/messages`, { params })
}

export async function MarcarMensagensComoLidas(ticketId) {
  return api.put(`/tickets/${ticketId}/messages/read`)
}

export async function AtualizarStatus(ticketId, status) {
  return api.put(`/tickets/${ticketId}/status`, { status })
}

export async function AtualizarFila(ticketId, queueId) {
  return api.put(`/tickets/${ticketId}/queue`, { queueId })
}

export async function AtualizarUsuario(ticketId, userId) {
  return api.put(`/tickets/${ticketId}/user`, { userId })
}

export async function AtualizarTags(ticketId, tags) {
  return api.put(`/tickets/${ticketId}/tags`, { tags })
}

export async function AtualizarNotas(ticketId, notes) {
  return api.put(`/tickets/${ticketId}/notes`, { notes })
}

export async function AtualizarCamposPersonalizados(ticketId, customFields) {
  return api.put(`/tickets/${ticketId}/custom-fields`, { customFields })
}

export async function DeletarTicket(id) {
  return api.delete(`/tickets/${id}`)
}

export async function DeletarMensagem(ticketId, messageId) {
  return api.delete(`/tickets/${ticketId}/messages/${messageId}`)
}
