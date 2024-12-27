export interface WhatsAppSession {
  id: number
  name: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'QRCODE' | 'CONNECTING'
  qrcode: string | null
  number: string
  battery: string
  plugged: boolean
  createdAt: Date
  updatedAt: Date
  isDefault: boolean
  retries: number
}

export interface WhatsAppState {
  sessions: WhatsAppSession[]
  loading: boolean
  error: string | null
}

export interface WhatsAppResponse {
  sessions: WhatsAppSession[]
  message?: string
}

export interface WhatsAppActions {
  fetchSessions(): Promise<void>
  startSession(id: number): Promise<void>
  disconnectSession(id: number): Promise<void>
  setDefaultSession(id: number): Promise<void>
}

export interface WhatsAppGetters {
  getSessionById: (id: number) => WhatsAppSession | undefined
  getDefaultSession: () => WhatsAppSession | undefined
  getConnectedSessions: () => WhatsAppSession[]
  hasActiveSessions: () => boolean
}

export interface WhatsAppStore {
  state: WhatsAppState
  actions: WhatsAppActions
  getters: WhatsAppGetters
}
