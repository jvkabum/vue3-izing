import { ref, computed } from 'vue'
import { useNotificationSystem } from '../sistema/useNotificationSystem'
import { useSettings } from './useSettings'

export function useSettingsForm() {
  // Composables
  const { notifySuccess, notifyError } = useNotificationSystem()
  const { loadSettings, saveSettings } = useSettings()

  // Estado
  const loading = ref(false)
  const originalSettings = ref(null)
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
      maxTicketsPerUser: 5
    },
    notifications: {
      sound: true,
      desktop: true,
      email: false,
      emailFrequency: 'daily'
    }
  })

  // Opções
  const timezones = [
    { label: 'Brasília (UTC-3)', value: 'America/Sao_Paulo' },
    { label: 'Fernando de Noronha (UTC-2)', value: 'America/Noronha' },
    { label: 'Manaus (UTC-4)', value: 'America/Manaus' },
    { label: 'Acre (UTC-5)', value: 'America/Rio_Branco' }
  ]

  const languages = [
    { label: 'Português (Brasil)', value: 'pt-BR' },
    { label: 'English (US)', value: 'en-US' },
    { label: 'Español', value: 'es' }
  ]

  const currencies = [
    { label: 'Real (R$)', value: 'BRL' },
    { label: 'Dollar ($)', value: 'USD' },
    { label: 'Euro (€)', value: 'EUR' }
  ]

  const emailFrequencies = [
    { label: 'Diário', value: 'daily' },
    { label: 'Semanal', value: 'weekly' },
    { label: 'Mensal', value: 'monthly' }
  ]

  // Computed
  const hasChanges = computed(() => {
    if (!originalSettings.value) return false
    return JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value)
  })

  const isValid = computed(() => {
    // Validações básicas
    const { general, chat } = settings.value
    return (
      general.companyName &&
      general.timezone &&
      general.language &&
      chat.maxQueueTime > 0 &&
      chat.maxTicketsPerUser > 0
    )
  })

  // Métodos
  const init = async () => {
    try {
      loading.value = true
      const data = await loadSettings()
      settings.value = {
        ...settings.value,
        ...data
      }
      originalSettings.value = JSON.parse(JSON.stringify(settings.value))
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      notifyError('Erro ao carregar configurações')
    } finally {
      loading.value = false
    }
  }

  const save = async () => {
    if (!isValid.value) {
      notifyError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    try {
      loading.value = true
      await saveSettings(settings.value)
      originalSettings.value = JSON.parse(JSON.stringify(settings.value))
      notifySuccess('Configurações salvas com sucesso')
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      notifyError('Erro ao salvar configurações')
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    if (originalSettings.value) {
      settings.value = JSON.parse(JSON.stringify(originalSettings.value))
    }
  }

  const handleChange = () => {
    // Este método existe apenas para forçar a reavaliação do computed hasChanges
    // quando os campos são alterados
  }

  return {
    // Estado
    settings,
    loading,
    hasChanges,
    isValid,

    // Opções
    timezones,
    languages,
    currencies,
    emailFrequencies,

    // Métodos
    init,
    save,
    reset,
    handleChange
  }
}
