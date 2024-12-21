import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'

export function useSettings() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()
  const { isAdmin } = useAuth()
  const { notify } = useNotification()

  // Estado
  const settings = ref({
    general: {
      companyName: '',
      companyLogo: '',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      currency: 'BRL'
    },
    chat: {
      welcomeMessage: '',
      farewellMessage: '',
      outOfHoursMessage: '',
      maxQueueTime: 30,
      maxTicketsPerUser: 5,
      autoCloseTimeout: 24,
      autoTransferTimeout: 30
    },
    notifications: {
      sound: true,
      desktop: true,
      email: {
        enabled: false,
        server: '',
        port: 587,
        secure: true,
        user: '',
        password: ''
      },
      telegram: {
        enabled: false,
        token: '',
        chatId: ''
      }
    },
    security: {
      loginAttempts: 5,
      lockoutTime: 15,
      passwordMinLength: 8,
      requireSpecialChars: true,
      sessionTimeout: 24
    },
    business: {
      workingHours: {
        enabled: true,
        schedule: {
          mon: { start: '09:00', end: '18:00', enabled: true },
          tue: { start: '09:00', end: '18:00', enabled: true },
          wed: { start: '09:00', end: '18:00', enabled: true },
          thu: { start: '09:00', end: '18:00', enabled: true },
          fri: { start: '09:00', end: '18:00', enabled: true },
          sat: { start: '09:00', end: '13:00', enabled: false },
          sun: { start: '09:00', end: '13:00', enabled: false }
        }
      },
      holidays: []
    },
    integrations: {
      whatsapp: {
        enabled: true,
        multidevice: true,
        webhook: ''
      },
      facebook: {
        enabled: false,
        pageId: '',
        accessToken: ''
      },
      instagram: {
        enabled: false,
        accountId: '',
        accessToken: ''
      }
    }
  })
  const loading = ref(false)
  const error = ref(null)
  const unsavedChanges = ref(false)

  // Computed
  const isWorkingHours = computed(() => {
    if (!settings.value.business.workingHours.enabled) return true

    const now = new Date()
    const day = now.toLocaleLowerCase().slice(0, 3)
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    
    const schedule = settings.value.business.workingHours.schedule[day]
    if (!schedule?.enabled) return false

    return time >= schedule.start && time <= schedule.end
  })

  const isHoliday = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return settings.value.business.holidays.some(h => h.date === today)
  })

  const currentStatus = computed(() => {
    if (!settings.value.business.workingHours.enabled) return 'online'
    if (isHoliday.value) return 'holiday'
    if (!isWorkingHours.value) return 'offline'
    return 'online'
  })

  // Métodos
  const loadSettings = async () => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get('/settings')
      settings.value = {
        ...settings.value,
        ...data
      }
      unsavedChanges.value = false

      return data
    } catch (err) {
      error.value = 'Erro ao carregar configurações'
      console.error('Erro ao carregar configurações:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (section, data) => {
    if (!isAdmin.value) {
      notify({
        type: 'negative',
        message: 'Sem permissão para alterar configurações',
        position: 'top'
      })
      return false
    }

    try {
      loading.value = true
      error.value = null

      const { data: updatedData } = await api.put(`/settings/${section}`, data)
      
      settings.value = {
        ...settings.value,
        [section]: updatedData
      }
      unsavedChanges.value = false

      notify({
        type: 'positive',
        message: 'Configurações atualizadas com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao atualizar configurações'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetSettings = async (section) => {
    try {
      loading.value = true
      error.value = null

      await api.post(`/settings/${section}/reset`)
      await loadSettings()

      notify({
        type: 'positive',
        message: 'Configurações resetadas com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao resetar configurações'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWorkingHours = async (schedule) => {
    return updateSettings('business', {
      workingHours: {
        ...settings.value.business.workingHours,
        schedule
      }
    })
  }

  const addHoliday = async (holiday) => {
    const holidays = [...settings.value.business.holidays, holiday]
    return updateSettings('business', {
      holidays
    })
  }

  const removeHoliday = async (date) => {
    const holidays = settings.value.business.holidays.filter(h => h.date !== date)
    return updateSettings('business', {
      holidays
    })
  }

  const testEmailSettings = async () => {
    try {
      loading.value = true
      error.value = null

      await api.post('/settings/notifications/email/test')
      
      notify({
        type: 'positive',
        message: 'E-mail de teste enviado com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao testar configurações de e-mail'
      throw err
    } finally {
      loading.value = false
    }
  }

  const testTelegramSettings = async () => {
    try {
      loading.value = true
      error.value = null

      await api.post('/settings/notifications/telegram/test')
      
      notify({
        type: 'positive',
        message: 'Mensagem de teste enviada com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao testar configurações do Telegram'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Socket handlers
  const handleSettingsUpdate = (data) => {
    settings.value = {
      ...settings.value,
      ...data
    }
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('settings:update', handleSettingsUpdate)
  }

  const removeSocketListeners = () => {
    socket.value?.off('settings:update', handleSettingsUpdate)
  }

  // Lifecycle hooks
  onMounted(() => {
    setupSocketListeners()
    loadSettings()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  // Watch for changes
  watch(settings, () => {
    unsavedChanges.value = true
  }, { deep: true })

  return {
    // Estado
    settings,
    loading,
    error,
    unsavedChanges,

    // Computed
    isWorkingHours,
    isHoliday,
    currentStatus,

    // Métodos
    loadSettings,
    updateSettings,
    resetSettings,
    updateWorkingHours,
    addHoliday,
    removeHoliday,
    testEmailSettings,
    testTelegramSettings
  }
}
