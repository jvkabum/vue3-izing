import { ref } from 'vue'
import { ListarAPIs, CriarAPI, EditarAPI, ApagarAPI, NovoTokenAPI } from 'src/service/api'
import { useApiNotification } from './useApiNotification'
import { useApiDialog } from './useApiDialog'

export function useApiConfig() {
  const apis = ref([])
  const loading = ref(false)
  const { 
    notifyApiCreated,
    notifyApiUpdated,
    notifyApiDeleted,
    notifyApiError,
    notifyTokenUpdated,
    notifyTokenError,
    notifyDeleteError
  } = useApiNotification()
  const { confirmarGerarToken, confirmarDeletar } = useApiDialog()

  const listarAPIs = async () => {
    try {
      const { data } = await ListarAPIs()
      apis.value = data.apis
    } catch {
      notifyApiError()
    }
  }

  const criarAPI = async api => {
    loading.value = true
    try {
      const { data } = await CriarAPI(api)
      notifyApiCreated()
      return data
    } catch {
      notifyApiError()
      throw new Error('Erro ao salvar API')
    } finally {
      loading.value = false
    }
  }

  const editarAPI = async api => {
    loading.value = true
    try {
      const { data } = await EditarAPI(api)
      notifyApiUpdated()
      return data
    } catch {
      notifyApiError()
      throw new Error('Erro ao salvar API')
    } finally {
      loading.value = false
    }
  }

  const apagarAPI = async api => {
    const confirmed = await confirmarDeletar(api.name)
    if (!confirmed) return

    loading.value = true
    try {
      await ApagarAPI(api)
      notifyApiDeleted(api.name)
      apis.value = apis.value.filter(a => a.id !== api.id)
    } catch {
      notifyDeleteError(api.name)
      throw new Error('Erro ao deletar API')
    } finally {
      loading.value = false
    }
  }

  const gerarNovoToken = async api => {
    const confirmed = await confirmarGerarToken(api.name)
    if (!confirmed) return

    loading.value = true
    try {
      const { data } = await NovoTokenAPI(api)
      notifyTokenUpdated()
      return data
    } catch {
      notifyTokenError()
      throw new Error('Erro ao gerar novo token')
    } finally {
      loading.value = false
    }
  }

  return {
    apis,
    loading,
    listarAPIs,
    criarAPI,
    editarAPI,
    apagarAPI,
    gerarNovoToken
  }
}
