import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'

export function useApi() {
  // Composables
  const $q = useQuasar()
  const { isAdmin } = useAuth()
  const { notify } = useNotification()

  // Estado
  const apiKeys = ref([])
  const webhooks = ref([])
  const integrations = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Tipos de integração
  const integrationType = {
    CRM: {
      name: 'CRM',
      icon: 'mdi-account-group',
      color: 'primary'
    },
    ERP: {
      name: 'ERP',
      icon: 'mdi-domain',
      color: 'secondary'
    },
    ECOMMERCE: {
      name: 'E-commerce',
      icon: 'mdi-shopping',
      color: 'positive'
    },
    CUSTOM: {
      name: 'Personalizado',
      icon: 'mdi-code-tags',
      color: 'info'
    }
  }

  // Métodos HTTP permitidos
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

  // Computed
  const activeIntegrations = computed(() => 
    integrations.value.filter(i => i.active)
  )

  const activeWebhooks = computed(() => 
    webhooks.value.filter(w => w.active)
  )

  // Métodos - API Keys
  const generateApiKey = async (description) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post('/api/keys', { description })
      apiKeys.value.unshift(data)

      notify({
        type: 'positive',
        message: 'Chave API gerada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao gerar chave API'
      throw err
    } finally {
      loading.value = false
    }
  }

  const revokeApiKey = async (keyId) => {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/api/keys/${keyId}`)
      apiKeys.value = apiKeys.value.filter(k => k.id !== keyId)

      notify({
        type: 'positive',
        message: 'Chave API revogada com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao revogar chave API'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Métodos - Webhooks
  const createWebhook = async (webhookData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post('/webhooks', webhookData)
      webhooks.value.unshift(data)

      notify({
        type: 'positive',
        message: 'Webhook criado com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao criar webhook'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWebhook = async (webhookId, webhookData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.put(`/webhooks/${webhookId}`, webhookData)
      
      const index = webhooks.value.findIndex(w => w.id === webhookId)
      if (index !== -1) {
        webhooks.value[index] = data
      }

      notify({
        type: 'positive',
        message: 'Webhook atualizado com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar webhook'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWebhook = async (webhookId) => {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/webhooks/${webhookId}`)
      webhooks.value = webhooks.value.filter(w => w.id !== webhookId)

      notify({
        type: 'positive',
        message: 'Webhook removido com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao remover webhook'
      throw err
    } finally {
      loading.value = false
    }
  }

  const testWebhook = async (webhookId) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post(`/webhooks/${webhookId}/test`)

      notify({
        type: 'positive',
        message: 'Teste de webhook enviado com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao testar webhook'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Métodos - Integrações
  const createIntegration = async (integrationData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post('/integrations', integrationData)
      integrations.value.unshift(data)

      notify({
        type: 'positive',
        message: 'Integração criada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao criar integração'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateIntegration = async (integrationId, integrationData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.put(`/integrations/${integrationId}`, integrationData)
      
      const index = integrations.value.findIndex(i => i.id === integrationId)
      if (index !== -1) {
        integrations.value[index] = data
      }

      notify({
        type: 'positive',
        message: 'Integração atualizada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar integração'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteIntegration = async (integrationId) => {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/integrations/${integrationId}`)
      integrations.value = integrations.value.filter(i => i.id !== integrationId)

      notify({
        type: 'positive',
        message: 'Integração removida com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao remover integração'
      throw err
    } finally {
      loading.value = false
    }
  }

  const testIntegration = async (integrationId) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post(`/integrations/${integrationId}/test`)

      notify({
        type: 'positive',
        message: 'Teste de integração realizado com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao testar integração'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Métodos - Documentação
  const generateApiDocs = async () => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get('/api/docs', {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = 'api-docs.pdf'
      link.click()
      window.URL.revokeObjectURL(url)

      notify({
        type: 'positive',
        message: 'Documentação gerada com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao gerar documentação'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Métodos - Logs
  const getIntegrationLogs = async (integrationId, params = {}) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get(`/integrations/${integrationId}/logs`, {
        params
      })

      return data
    } catch (err) {
      error.value = 'Erro ao buscar logs'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getWebhookLogs = async (webhookId, params = {}) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get(`/webhooks/${webhookId}/logs`, {
        params
      })

      return data
    } catch (err) {
      error.value = 'Erro ao buscar logs'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Lifecycle
  onMounted(async () => {
    try {
      loading.value = true
      
      const [apiKeysData, webhooksData, integrationsData] = await Promise.all([
        api.get('/api/keys'),
        api.get('/webhooks'),
        api.get('/integrations')
      ])

      apiKeys.value = apiKeysData.data
      webhooks.value = webhooksData.data
      integrations.value = integrationsData.data
    } catch (err) {
      error.value = 'Erro ao carregar dados'
      console.error('Erro ao carregar dados:', err)
    } finally {
      loading.value = false
    }
  })

  return {
    // Estado
    apiKeys,
    webhooks,
    integrations,
    loading,
    error,

    // Constantes
    integrationType,
    allowedMethods,

    // Computed
    activeIntegrations,
    activeWebhooks,

    // Métodos - API Keys
    generateApiKey,
    revokeApiKey,

    // Métodos - Webhooks
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,

    // Métodos - Integrações
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegration,

    // Métodos - Documentação
    generateApiDocs,

    // Métodos - Logs
    getIntegrationLogs,
    getWebhookLogs
  }
}
