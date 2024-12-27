// Vue
declare module 'vue' {
  export interface GlobalComponents {
    Component: DefineComponent<{}, {}, any>
  }
}

// Store
declare module 'src/stores' {
  export function useStore(): any
}

// Socket.io
declare module 'src/utils/socket' {
  export function socketIO(): any
}

// Date-fns
declare module 'date-fns/locale/pt-BR' {
  const locale: Locale
  export default locale
}

// Ticket Types
interface Ticket {
  id: number
  status: 'open' | 'pending' | 'closed'
  userId?: number
  isTransference?: boolean
  contactId?: number
  contact?: {
    id: number
    name: string
    number: string
  }
}

interface Message {
  id: number
  ticketId: number
  body: string
  read: boolean
  fromMe: boolean
  contact?: {
    id: number
    name: string
  }
}

// API Response Types
interface TicketResponse {
  tickets: Ticket[]
  count: number
  hasMore: boolean
}

// Notification Types
interface NotificationPayload {
  id: number
  contact: {
    name: string
  }
  ticket: Ticket
}

// Socket Event Types
interface SocketTicketEvent {
  action: 'update' | 'create' | 'delete'
  ticket: Ticket
}

interface SocketMessageEvent {
  type: 'chat:create' | 'chat:update' | 'chat:delete' | 'chat:ack'
  payload: Message
}

interface SocketNotificationEvent {
  type: 'notification:new'
  payload: NotificationPayload
}

// Store Types
interface StoreState {
  ticketFocado: Ticket
  messages: Message[]
  notifications: any[]
  hasMore: boolean
}

interface StoreGetters {
  ticketFocado: Ticket
  mensagensTicket: Message[]
  hasMore: boolean
}

interface StoreMutations {
  TICKET_FOCADO: (ticket: Ticket) => void
  UPDATE_MESSAGES: (message: Message) => void
  UPDATE_MESSAGE: (message: Message) => void
  UPDATE_MESSAGE_STATUS: (message: Message) => void
  UPDATE_TICKET: (ticket: Ticket) => void
  UPDATE_NOTIFICATIONS: (data: any) => void
  UPDATE_NOTIFICATIONS_P: (data: any) => void
  UPDATE_CONTACT: (contact: any) => void
  SET_HAS_MORE: (hasMore: boolean) => void
}

interface StoreActions {
  AbrirChatMensagens: (ticket: Ticket) => Promise<void>
}

// Utility Types
type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}
