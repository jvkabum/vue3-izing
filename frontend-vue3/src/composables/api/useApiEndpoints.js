import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useNotificationSystem } from '../sistema/useNotificationSystem'

export function useApiEndpoints() {
  const $q = useQuasar()
  const { notifySuccess, notifyError } = useNotificationSystem()

  // Estado
  const endpoints = ref([])
  const showDialog = ref(false)
  const showConfirmDialog = ref(false)
  const editingEndpoint = ref(null)
  const endpointToDelete = ref(null)

  const form = ref({
    name: '',
    method: 'GET',
    path: '',
    description: ''
  })

  // Constantes
  const methodColors = {
    GET: 'primary',
    POST: 'positive',
    PUT: 'warning',
    DELETE: 'negative',
    PATCH: 'info'
  }

  // Métodos
  function openDialog(endpoint = null) {
    editingEndpoint.value = endpoint
    if (endpoint) {
      form.value = { ...endpoint }
    } else {
      form.value = {
        name: '',
        method: 'GET',
        path: '',
        description: ''
      }
    }
    showDialog.value = true
  }

  async function saveEndpoint() {
    try {
      if (editingEndpoint.value) {
        // Atualizar endpoint existente
        await updateEndpoint(form.value)
        notifySuccess('Endpoint atualizado com sucesso')
      } else {
        // Criar novo endpoint
        await createEndpoint(form.value)
        notifySuccess('Endpoint criado com sucesso')
      }
      showDialog.value = false
      await loadEndpoints()
    } catch (error) {
      notifyError('Erro ao salvar endpoint')
    }
  }

  function confirmDelete(endpoint) {
    endpointToDelete.value = endpoint
    showConfirmDialog.value = true
  }

  async function deleteEndpoint() {
    try {
      await deleteEndpointApi(endpointToDelete.value.id)
      notifySuccess('Endpoint excluído com sucesso')
      await loadEndpoints()
    } catch (error) {
      notifyError('Erro ao excluir endpoint')
    }
  }

  function copyEndpoint(endpoint) {
    const baseUrl = process.env.VUE_APP_API_URL || ''
    const url = `${baseUrl}${endpoint.path}`
    
    navigator.clipboard.writeText(url).then(() => {
      notifySuccess('URL copiada para a área de transferência')
    }).catch(() => {
      notifyError('Erro ao copiar URL')
    })
  }

  async function loadEndpoints() {
    try {
      const { data } = await getEndpoints()
      endpoints.value = data
    } catch (error) {
      notifyError('Erro ao carregar endpoints')
    }
  }

  return {
    // Estado
    endpoints,
    showDialog,
    showConfirmDialog,
    editingEndpoint,
    endpointToDelete,
    form,
    methodColors,

    // Métodos
    openDialog,
    saveEndpoint,
    confirmDelete,
    deleteEndpoint,
    copyEndpoint,
    loadEndpoints
  }
}
