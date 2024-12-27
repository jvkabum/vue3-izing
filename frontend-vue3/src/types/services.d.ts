// Service Response Types
interface ServiceResponse<T> {
  data: T
  status: number
  statusText: string
}

// Tickets Service
declare module 'src/service/tickets' {
  import type { Ticket, Message } from './atendimento'

  export function ConsultarTickets(params: any): Promise<ServiceResponse<{
    tickets: Ticket[]
    count: number
    hasMore: boolean
  }>>

  export function ConsultarMensagens(ticketId: number): Promise<ServiceResponse<{
    messages: Message[]
    ticket: Ticket
    count: number
    hasMore: boolean
  }>>

  export function EnviarMensagemTexto(ticketId: number, data: any): Promise<ServiceResponse<Message>>

  export function AtualizarTicket(ticketId: number, data: any): Promise<ServiceResponse<Ticket>>

  export function DeletarMensagem(messageId: number): Promise<ServiceResponse<Message>>
}

// Users Service
declare module 'src/service/user' {
  interface User {
    id: number
    name: string
    email: string
    profile: string
    queues: Array<{
      id: number
      queue: string
      isActive: boolean
    }>
  }

  export function ListarUsuarios(): Promise<ServiceResponse<{
    users: User[]
  }>>
}

// Queues Service
declare module 'src/service/filas' {
  interface Queue {
    id: number
    queue: string
    isActive: boolean
  }

  export function ListarFilas(): Promise<ServiceResponse<Queue[]>>
}

// External Libraries
declare module 'mic-recorder-to-mp3' {
  export default class MicRecorder {
    constructor(options?: { bitRate?: number })
    start(): Promise<void>
    stop(): {
      getMp3(): Promise<[AudioBuffer, Blob]>
    }
  }
}

// Quasar Utilities
declare module 'quasar' {
  export function uid(): string

  export interface QNotifyConfig {
    type?: 'positive' | 'negative' | 'warning' | 'info'
    message: string
    caption?: string
    html?: boolean
    position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    progress?: boolean
    actions?: Array<{
      icon?: string
      color?: string
      handler?: () => void
      [key: string]: any
    }>
  }

  export interface QuasarInstance {
    notify: (config: QNotifyConfig) => void
    screen: {
      width: number
      height: number
      lt: {
        sm: boolean
        md: boolean
        lg: boolean
      }
    }
    dark: {
      isActive: boolean
    }
  }

  export function useQuasar(): QuasarInstance
}

// Error Types
interface ApiError extends Error {
  status?: number
  response?: {
    data?: {
      message?: string
    }
  }
}
