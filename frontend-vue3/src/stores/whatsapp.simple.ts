import { defineStore } from 'pinia'
import { socketIO } from '../utils/socket'
import type { WhatsAppSession, WhatsAppResponse } from '../types/stores/whatsapp.types'
import { 
  StartWhatsappSession, 
  ListarWhatsapps, 
  DeleteWhatsappSession, 
  UpdateWhatsapp 
} from '../service/sessoesWhatsapp'

const socket = socketIO()

interface State {
  sessions: WhatsAppSession[]
  loading: boolean
  error: string | null
}

export const useWhatsAppStore = defineStore('whatsapp', {
  state: (): State => ({
    sessions: [],
    loading: false,
    error: null
  }),

  getters: {
    getSessionById: (state) => {
      return (id: number) => state.sessions.find(session => session.id === id)
    },
    getDefaultSession: (state) => {
      return state.sessions.find(session => session.isDefault)
    },
    getConnectedSessions: (state) => {
      return state.sessions.filter(session => session.status === 'CONNECTED')
    },
    hasActiveSessions: (state) => {
      return state.sessions.some(session => session.status === 'CONNECTED')
    }
  },

  actions: {
    async fetchSessions() {
      this.loading = true
      this.error = null
      try {
        const { data } = await ListarWhatsapps()
        this.sessions = data.sessions
      } catch (err) {
        console.error('Erro ao buscar sessões:', err)
        this.error = 'Erro ao buscar sessões do WhatsApp'
        this.showNotification({
          type: 'negative',
          message: 'Erro ao buscar sessões do WhatsApp'
        })
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
        this.showNotification({
          type: 'negative',
          message: 'Erro ao iniciar sessão do WhatsApp'
        })
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
        this.showNotification({
          type: 'positive',
          message: 'Sessão desconectada com sucesso'
        })
      } catch (err) {
        console.error('Erro ao desconectar sessão:', err)
        this.error = 'Erro ao desconectar sessão do WhatsApp'
        this.showNotification({
          type: 'negative',
          message: 'Erro ao desconectar sessão do WhatsApp'
        })
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
        this.showNotification({
          type: 'positive',
          message: 'Sessão padrão definida com sucesso'
        })
      } catch (err) {
        console.error('Erro ao definir sessão padrão:', err)
        this.error = 'Erro ao definir sessão padrão'
        this.showNotification({
          type: 'negative',
          message: 'Erro ao definir sessão padrão'
        })
      } finally {
        this.loading = false
      }
    },

    showNotification(opts: { type: string; message: string }) {
      // @ts-ignore - Using global Quasar object
      if (globalThis.$q) {
        globalThis.$q.notify({
          ...opts,
          position: 'top',
          progress: true
        })
      }
    },

    // Socket event handler
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
