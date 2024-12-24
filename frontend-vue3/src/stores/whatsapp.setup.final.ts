import { defineStore } from 'pinia'
import { ref } from 'vue'
import { socketIO } from '../utils/socket'
import type { WhatsAppSession, WhatsAppResponse } from '../types/stores/whatsapp.types'
import { 
  StartWhatsappSession, 
  ListarWhatsapps, 
  DeleteWhatsappSession, 
  UpdateWhatsapp 
} from '../service/sessoesWhatsapp'

const socket = socketIO()

type NotifyOptions = {
  type: 'positive' | 'negative'
  message: string
}

export const useWhatsAppStore = defineStore('whatsapp', () => {
  // state
  const sessions = ref<WhatsAppSession[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // helpers
  function showNotification(opts: NotifyOptions) {
    // @ts-ignore - Using global Quasar object
    if (globalThis.$q) {
      globalThis.$q.notify({
        ...opts,
        position: 'top',
        progress: true
      })
    }
  }

  // actions
  async function fetchSessions() {
    loading.value = true
    error.value = null
    try {
      const { data } = await ListarWhatsapps()
      sessions.value = data.sessions
    } catch (err) {
      console.error('Erro ao buscar sessões:', err)
      error.value = 'Erro ao buscar sessões do WhatsApp'
      showNotification({
        type: 'negative',
        message: 'Erro ao buscar sessões do WhatsApp'
      })
    } finally {
      loading.value = false
    }
  }

  async function startSession(id: number) {
    loading.value = true
    error.value = null
    try {
      const { data } = await StartWhatsappSession(id)
      const index = sessions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sessions.value[index] = { ...sessions.value[index], ...data }
      }
      socket.emit('requireUpdateSessions')
    } catch (err) {
      console.error('Erro ao iniciar sessão:', err)
      error.value = 'Erro ao iniciar sessão do WhatsApp'
      showNotification({
        type: 'negative',
        message: 'Erro ao iniciar sessão do WhatsApp'
      })
    } finally {
      loading.value = false
    }
  }

  async function disconnectSession(id: number) {
    loading.value = true
    error.value = null
    try {
      await DeleteWhatsappSession(id)
      const index = sessions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sessions.value[index].status = 'DISCONNECTED'
      }
      socket.emit('requireUpdateSessions')
      showNotification({
        type: 'positive',
        message: 'Sessão desconectada com sucesso'
      })
    } catch (err) {
      console.error('Erro ao desconectar sessão:', err)
      error.value = 'Erro ao desconectar sessão do WhatsApp'
      showNotification({
        type: 'negative',
        message: 'Erro ao desconectar sessão do WhatsApp'
      })
    } finally {
      loading.value = false
    }
  }

  async function setDefaultSession(id: number) {
    loading.value = true
    error.value = null
    try {
      await UpdateWhatsapp(id, { isDefault: true })
      sessions.value = sessions.value.map(session => ({
        ...session,
        isDefault: session.id === id
      }))
      showNotification({
        type: 'positive',
        message: 'Sessão padrão definida com sucesso'
      })
    } catch (err) {
      console.error('Erro ao definir sessão padrão:', err)
      error.value = 'Erro ao definir sessão padrão'
      showNotification({
        type: 'negative',
        message: 'Erro ao definir sessão padrão'
      })
    } finally {
      loading.value = false
    }
  }

  function handleWhatsAppSession(data: WhatsAppResponse) {
    if (data.sessions) {
      sessions.value = data.sessions
    }
  }

  // getters
  function getSessionById(id: number) {
    return sessions.value.find(session => session.id === id)
  }

  function getDefaultSession() {
    return sessions.value.find(session => session.isDefault)
  }

  function getConnectedSessions() {
    return sessions.value.filter(session => session.status === 'CONNECTED')
  }

  function hasActiveSessions() {
    return sessions.value.some(session => session.status === 'CONNECTED')
  }

  // Setup socket listener
  socket.on('whatsappSession', handleWhatsAppSession)

  return {
    // state
    sessions,
    loading,
    error,
    // getters
    getSessionById,
    getDefaultSession,
    getConnectedSessions,
    hasActiveSessions,
    // actions
    fetchSessions,
    startSession,
    disconnectSession,
    setDefaultSession,
    handleWhatsAppSession
  }
})
