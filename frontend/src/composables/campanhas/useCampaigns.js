import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useCampaigns() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()
  const { isAdmin } = useAuth()
  const { notify } = useNotification()

  // Estado
  const campaigns = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentCampaign = ref(null)
  const filters = ref({
    status: 'all',
    search: '',
    dateRange: null,
    type: 'all'
  })

  // Computed
  const filteredCampaigns = computed(() => {
    let result = [...campaigns.value]

    // Busca
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(campaign => 
        campaign.name.toLowerCase().includes(search) ||
        campaign.description?.toLowerCase().includes(search)
      )
    }

    // Status
    if (filters.value.status !== 'all') {
      result = result.filter(campaign => 
        campaign.status === filters.value.status
      )
    }

    // Tipo
    if (filters.value.type !== 'all') {
      result = result.filter(campaign => 
        campaign.type === filters.value.type
      )
    }

    // Data
    if (filters.value.dateRange) {
      const [start, end] = filters.value.dateRange
      result = result.filter(campaign => {
        const date = parseISO(campaign.scheduledAt || campaign.createdAt)
        return date >= start && date <= end
      })
    }

    return result
  })

  const campaignStats = computed(() => ({
    total: campaigns.value.length,
    active: campaigns.value.filter(c => c.status === 'active').length,
    scheduled: campaigns.value.filter(c => c.status === 'scheduled').length,
    completed: campaigns.value.filter(c => c.status === 'completed').length,
    canceled: campaigns.value.filter(c => c.status === 'canceled').length
  }))

  // Métodos
  const loadCampaigns = async () => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get('/campaigns')
      campaigns.value = data

      return data
    } catch (err) {
      error.value = 'Erro ao carregar campanhas'
      console.error('Erro ao carregar campanhas:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCampaign = async (campaignData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post('/campaigns', campaignData)
      campaigns.value.unshift(data)

      notify({
        type: 'positive',
        message: 'Campanha criada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao criar campanha'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCampaign = async (campaignId, campaignData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.put(`/campaigns/${campaignId}`, campaignData)
      
      const index = campaigns.value.findIndex(c => c.id === campaignId)
      if (index !== -1) {
        campaigns.value[index] = data
      }

      if (currentCampaign.value?.id === campaignId) {
        currentCampaign.value = data
      }

      notify({
        type: 'positive',
        message: 'Campanha atualizada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar campanha'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCampaign = async (campaignId) => {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/campaigns/${campaignId}`)
      campaigns.value = campaigns.value.filter(c => c.id !== campaignId)

      if (currentCampaign.value?.id === campaignId) {
        currentCampaign.value = null
      }

      notify({
        type: 'positive',
        message: 'Campanha removida com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao remover campanha'
      throw err
    } finally {
      loading.value = false
    }
  }

  const startCampaign = async (campaignId) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post(`/campaigns/${campaignId}/start`)
      
      const index = campaigns.value.findIndex(c => c.id === campaignId)
      if (index !== -1) {
        campaigns.value[index] = data
      }

      if (currentCampaign.value?.id === campaignId) {
        currentCampaign.value = data
      }

      notify({
        type: 'positive',
        message: 'Campanha iniciada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao iniciar campanha'
      throw err
    } finally {
      loading.value = false
    }
  }

  const pauseCampaign = async (campaignId) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post(`/campaigns/${campaignId}/pause`)
      
      const index = campaigns.value.findIndex(c => c.id === campaignId)
      if (index !== -1) {
        campaigns.value[index] = data
      }

      if (currentCampaign.value?.id === campaignId) {
        currentCampaign.value = data
      }

      notify({
        type: 'positive',
        message: 'Campanha pausada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao pausar campanha'
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelCampaign = async (campaignId) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post(`/campaigns/${campaignId}/cancel`)
      
      const index = campaigns.value.findIndex(c => c.id === campaignId)
      if (index !== -1) {
        campaigns.value[index] = data
      }

      if (currentCampaign.value?.id === campaignId) {
        currentCampaign.value = data
      }

      notify({
        type: 'positive',
        message: 'Campanha cancelada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao cancelar campanha'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getCampaignProgress = (campaign) => {
    const total = campaign.contacts?.length || 0
    const sent = campaign.messages?.length || 0
    const percentage = total > 0 ? Math.round((sent / total) * 100) : 0

    return {
      total,
      sent,
      pending: total - sent,
      percentage,
      failed: campaign.messages?.filter(m => m.status === 'failed').length || 0
    }
  }

  const formatScheduleDate = (date) => {
    if (!date) return ''
    return format(parseISO(date), "PPpp", { locale: ptBR })
  }

  // Socket handlers
  const handleCampaignUpdate = (data) => {
    const index = campaigns.value.findIndex(c => c.id === data.id)
    if (index !== -1) {
      campaigns.value[index] = data
    } else {
      campaigns.value.unshift(data)
    }

    if (currentCampaign.value?.id === data.id) {
      currentCampaign.value = data
    }
  }

  const handleCampaignDelete = (campaignId) => {
    campaigns.value = campaigns.value.filter(c => c.id !== campaignId)
    
    if (currentCampaign.value?.id === campaignId) {
      currentCampaign.value = null
    }
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('campaign:update', handleCampaignUpdate)
    socket.value?.on('campaign:delete', handleCampaignDelete)
  }

  const removeSocketListeners = () => {
    socket.value?.off('campaign:update', handleCampaignUpdate)
    socket.value?.off('campaign:delete', handleCampaignDelete)
  }

  // Lifecycle
  onMounted(() => {
    setupSocketListeners()
    loadCampaigns()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    campaigns,
    loading,
    error,
    currentCampaign,
    filters,

    // Computed
    filteredCampaigns,
    campaignStats,

    // Métodos
    loadCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    startCampaign,
    pauseCampaign,
    cancelCampaign,
    getCampaignProgress,
    formatScheduleDate
  }
}
