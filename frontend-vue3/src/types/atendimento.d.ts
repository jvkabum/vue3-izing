// Ticket Types
export interface Ticket {
  id: number
  status: 'open' | 'pending' | 'closed'
  userId?: number
  isGroup?: boolean
  isTransference?: boolean
  contactId?: number
  contact: Contact
  scheduledMessages?: ScheduledMessage[]
}

export interface Contact {
  id: number
  name: string
  number: string
  email?: string
  profilePicUrl?: string
  extraInfo?: ExtraInfo[]
  tags?: Tag[]
  wallets?: number[]
}

export interface ExtraInfo {
  id: number
  value: string
}

export interface Tag {
  id: number
  tag: string
  color: string
}

export interface ScheduledMessage {
  id: number
  body: string
  scheduleDate: string
  mediaName?: string
  isDeleted?: boolean
}

export interface User {
  id: number
  name: string
  email: string
  profile: string
  queues: Queue[]
}

export interface Queue {
  id: number
  queue: string
  isActive: boolean
}

export interface WhatsApp {
  id: number
  name: string
  status: string
  type: string
}

export interface SearchParams {
  searchParam: string
  pageNumber: number
  status: string[]
  showAll: boolean
  count: number | null
  queuesIds: number[]
  withUnreadMessages: boolean
  isNotAssignedUser: boolean
  includeNotQueueDefined: boolean
}

export interface TicketResponse {
  tickets: Ticket[]
  count: number
  hasMore: boolean
}

export interface LogEntry {
  id: number
  type: string
  message: string
  createdAt: string
  user?: {
    name: string
  }
}

// Error Types
export interface ApiError {
  message: string
  status?: number
  stack?: string
}

// Store Types
export interface AtendimentoState {
  tickets: Ticket[]
  ticketFocado: Ticket | null
  whatsapps: WhatsApp[]
  hasMore: boolean
}

export interface AtendimentoGetters {
  tickets: Ticket[]
  ticketFocado: Ticket | null
  whatsapps: WhatsApp[]
  hasMore: boolean
}

export interface AtendimentoMutations {
  LOAD_TICKETS: (tickets: Ticket[]) => void
  RESET_TICKETS: () => void
  TICKET_FOCADO: (ticket: Ticket | null) => void
  LOAD_WHATSAPPS: (whatsapps: WhatsApp[]) => void
  SET_HAS_MORE: (hasMore: boolean) => void
}

export interface AtendimentoActions {
  AbrirChatMensagens: (ticket: Ticket) => Promise<void>
}
