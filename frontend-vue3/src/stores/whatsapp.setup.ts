import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import { socketIO } from '../utils/socket'
import type { WhatsAppSession, WhatsAppResponse } from '../types/stores/whatsapp.types'
import { 
  StartWhatsappSession, 
  GetAllWhatsappSessions, 
  DisconnectWhatsappSession, 
  SetDefaultWhatsappSession 
} from '../service/sessoesWhatsapp'

const socket = socketIO()

export const useWhatsAppStore = defineStore('whatsapp', () => {
  // state
  const sessions = ref<WhatsAppSession[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // getters
  const getSessionById = computed(() => {
    return (id: number) => sessions.value.find(session => session.id === id)
  })

  const getDefaultSession = computed(() => {
    return sessions.value.find(session => session.isDefault)
  })

  const getConnectedSessions = computed(() => {
    return sessions.value.filter(session => session.status === 'CONNECTED')
  })

  const hasActiveSessions = computed(() => {
    return sessions.value.some(session => session.status === 'CONNECTED')
  })

  // actions
  async function fetchSessions() {
    loading.value = true
    error.value = null
    try {
      const { data } = await GetAllWhatsappSessions()
      sessions.value = data.sessions
    } catch (err) {
      console.error('Erro ao buscar sessões:', err)
      error.value = 'Erro ao buscar sessões do WhatsApp'
      Notify.create({
        type: 'negative',
        message: 'Erro ao buscar sessões do WhatsApp',
        position: 'top'
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
      Notify.create({
        type: 'negative',
        message: 'Erro ao iniciar sessão do WhatsApp',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  async function disconnectSession(id: number) {
    loading.value = true
    error.value = null
    try {
      await DisconnectWhatsappSession(id)
      const index = sessions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sessions.value[index].status = 'DISCONNECTED'
      }
      socket.emit('requireUpdateSessions')
      Notify.create({
        type: 'positive',
        message: 'Sessão desconectada com sucesso',
        position: 'top'
      })
    } catch (err) {
      console.error('Erro ao desconectar sessão:', err)
      error.value = 'Erro ao desconectar sessão do WhatsApp'
      Notify.create({
        type: 'negative',
        message: 'Erro ao desconectar sessão do WhatsApp',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  async function setDefaultSession(id: number) {
    loading.value = true
    error.value = null
    try {
      await SetDefaultWhatsappSession(id)
      sessions.value = sessions.value.map(session => ({
        ...session,
        isDefault: session.id === id
      }))
      Notify.create({
        type: 'positive',
        message: 'Sessão padrão definida com sucesso',
        position: 'top'
      })
    } catch (err) {
      console.error('Erro ao definir sessão padrão:', err)
      error.value = 'Erro ao definir sessão padrão'
      Notify.create({
        type: 'negative',
        message: 'Erro ao definir sessão padrão',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  // Socket event handlers
  socket.on('whatsappSession', (data: WhatsAppResponse) => {
    if (data.sessions) {
      sessions.value = data.sessions
    }
  })

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
    setDefaultSession
  }
})
