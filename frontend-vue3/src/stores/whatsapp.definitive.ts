import { defineStore, storeToRefs } from 'pinia'
import { socketIO } from '../utils/socket'
import type { WhatsAppSession, WhatsAppResponse } from '../types/stores/whatsapp.types'
import { 
  StartWhatsappSession, 
  ListarWhatsapps, 
  DeleteWhatsappSession, 
  UpdateWhatsapp 
} from '../service/sessoesWhatsapp'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $q: {
      notify: (config: {
        type?: 'positive' | 'negative'
        message: string
        position?: string
        progress?: boolean
      }) => void
    }
  }
}

const socket = socketIO()

interface WhatsAppStoreState {
  sessions: WhatsAppSession[]
  loading: boolean
  error: string | null
}

export const useWhatsAppStore = defineStore({
  id: 'whatsapp',

  state: (): WhatsAppStoreState => ({
    sessions: [],
    loading: false,
    error: null
  }),

  getters: {
    getSessionById: (state: WhatsAppStoreState) => (id: number) => 
      state.sessions.find(session => session.id === id),

    getDefaultSession: (state: WhatsAppStoreState) => 
      state.sessions.find(session => session.isDefault),

    getConnectedSessions: (state: WhatsAppStoreState) => 
      state.sessions.filter(session => session.status === 'CONNECTED'),

    hasActiveSessions: (state: WhatsAppStoreState) => 
      state.sessions.some(session => session.status === 'CONNECTED')
  },

  actions: {
    showNotification(type: 'positive' | 'negative', message: string) {
      // @ts-ignore
      if (globalThis.$q?.notify) {
        // @ts-ignore
        globalThis.$q.notify({
          type,
          message,
          position: 'top',
          progress: true
        })
      }
    },

    async fetchSessions() {
      this.loading = true
      this.error = null
      try {
        const { data } = await ListarWhatsapps()
        this.sessions = data.sessions
      } catch (err) {
        console.error('Erro ao buscar sessões:', err)
        this.error = 'Erro ao buscar sessões do WhatsApp'
        this.showNotification('negative', 'Erro ao buscar sessões do WhatsApp')
      } finally {
        this.loading = false
      }
    },

    async startSession(id: number) {
      this.loading = true
      this.error = null
      try {
        const { data } = await StartWhatsappSession(id)
        const index = this.sessions.findIndex(s => s.id === id)
        if (index !== -1) {
          this.sessions[index] = { ...this.sessions[index], ...data }
        }
        socket.emit('requireUpdateSessions')
      } catch (err) {
        console.error('Erro ao iniciar sessão:', err)
        this.error = 'Erro ao iniciar sessão do WhatsApp'
        this.showNotification('negative', 'Erro ao iniciar sessão do WhatsApp')
      } finally {
        this.loading = false
      }
    },

    async disconnectSession(id: number) {
      this.loading = true
      this.error = null
      try {
        await DeleteWhatsappSession(id)
        const index = this.sessions.findIndex(s => s.id === id)
        if (index !== -1) {
          this.sessions[index].status = 'DISCONNECTED'
        }
        socket.emit('requireUpdateSessions')
        this.showNotification('positive', 'Sessão desconectada com sucesso')
      } catch (err) {
        console.error('Erro ao desconectar sessão:', err)
        this.error = 'Erro ao desconectar sessão do WhatsApp'
        this.showNotification('negative', 'Erro ao desconectar sessão do WhatsApp')
      } finally {
        this.loading = false
      }
    },

    async setDefaultSession(id: number) {
      this.loading = true
      this.error = null
      try {
        await UpdateWhatsapp(id, { isDefault: true })
        this.sessions = this.sessions.map(session => ({
          ...session,
          isDefault: session.id === id
        }))
        this.showNotification('positive', 'Sessão padrão definida com sucesso')
      } catch (err) {
        console.error('Erro ao definir sessão padrão:', err)
        this.error = 'Erro ao definir sessão padrão'
        this.showNotification('negative', 'Erro ao definir sessão padrão')
      } finally {
        this.loading = false
      }
    },

    handleWhatsAppSession(data: WhatsAppResponse) {
      if (data.sessions) {
        this.sessions = data.sessions
      }
    }
  }
})

// Setup socket listener
socket.on('whatsappSession', (data: WhatsAppResponse) => {
  const store = useWhatsAppStore()
  store.handleWhatsAppSession(data)
})
