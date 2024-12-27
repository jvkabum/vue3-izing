import { ref } from 'vue'
import { api } from '../../service/api'

export function useCampaigns() {
  const campaigns = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadCampaigns() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/campaigns')
      campaigns.value = data
    } catch (err) {
      error.value = 'Erro ao carregar campanhas'
      console.error('Erro ao carregar campanhas:', err)
    } finally {
      loading.value = false
    }
  }

  async function saveCampaign(campaignData) {
    loading.value = true
    error.value = null
    try {
      if (campaignData.id) {
        // Atualizar campanha existente
        const { data } = await api.put(`/campaigns/${campaignData.id}`, campaignData)
        const index = campaigns.value.findIndex(c => c.id === data.id)
        if (index !== -1) {
          campaigns.value[index] = data
        }
      } else {
        // Criar nova campanha
        const { data } = await api.post('/campaigns', campaignData)
        campaigns.value.push(data)
      }
    } catch (err) {
      error.value = 'Erro ao salvar campanha'
      console.error('Erro ao salvar campanha:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCampaign(id) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/campaigns/${id}`)
      campaigns.value = campaigns.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = 'Erro ao excluir campanha'
      console.error('Erro ao excluir campanha:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getCampaign(id) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get(`/campaigns/${id}`)
      return data
    } catch (err) {
      error.value = 'Erro ao buscar campanha'
      console.error('Erro ao buscar campanha:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    campaigns,
    loading,
    error,

    // Methods
    loadCampaigns,
    saveCampaign,
    deleteCampaign,
    getCampaign
  }
}
