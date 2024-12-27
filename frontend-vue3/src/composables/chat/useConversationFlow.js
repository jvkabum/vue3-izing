import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'
import { uid } from 'quasar'

export function useChatFlow() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()
  const { isAdmin } = useAuth()
  const { notify } = useNotification()

  // Estado
  const flows = ref([])
  const currentFlow = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const unsavedChanges = ref(false)

  // Nós padrão
  const defaultNodes = {
    start: {
      type: 'start',
      name: 'Início',
      message: 'Olá! Como posso ajudar?',
      options: []
    },
    message: {
      type: 'message',
      name: 'Mensagem',
      message: '',
      delay: 1000,
      next: null
    },
    input: {
      type: 'input',
      name: 'Entrada',
      message: '',
      variable: '',
      validation: null,
      next: null
    },
    condition: {
      type: 'condition',
      name: 'Condição',
      variable: '',
      operator: 'equals',
      value: '',
      next: {
        true: null,
        false: null
      }
    },
    queue: {
      type: 'queue',
      name: 'Fila',
      queueId: null,
      message: ''
    },
    api: {
      type: 'api',
      name: 'API',
      url: '',
      method: 'GET',
      headers: {},
      body: {},
      variable: '',
      next: null
    }
  }

  // Computed
  const activeFlows = computed(() => 
    flows.value.filter(f => f.active)
  )

  const flowsByQueue = computed(() => {
    const grouped = {}
    flows.value.forEach(flow => {
      const queueId = flow.queueId || 'unassigned'
      if (!grouped[queueId]) {
        grouped[queueId] = []
      }
      grouped[queueId].push(flow)
    })
    return grouped
  })

  // Métodos
  const loadFlows = async () => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get('/chatbot/flows')
      flows.value = data

      return data
    } catch (err) {
      error.value = 'Erro ao carregar fluxos'
      console.error('Erro ao carregar fluxos:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createFlow = async (flowData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post('/chatbot/flows', {
        ...flowData,
        nodes: {
          start: {
            ...defaultNodes.start,
            id: uid()
          }
        }
      })

      flows.value.unshift(data)
      currentFlow.value = data
      unsavedChanges.value = false

      notify({
        type: 'positive',
        message: 'Fluxo criado com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao criar fluxo'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFlow = async (flowId, flowData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.put(`/chatbot/flows/${flowId}`, flowData)
      
      const index = flows.value.findIndex(f => f.id === flowId)
      if (index !== -1) {
        flows.value[index] = data
      }

      if (currentFlow.value?.id === flowId) {
        currentFlow.value = data
      }

      unsavedChanges.value = false

      notify({
        type: 'positive',
        message: 'Fluxo atualizado com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar fluxo'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteFlow = async (flowId) => {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/chatbot/flows/${flowId}`)
      flows.value = flows.value.filter(f => f.id !== flowId)

      if (currentFlow.value?.id === flowId) {
        currentFlow.value = null
      }

      notify({
        type: 'positive',
        message: 'Fluxo removido com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao remover fluxo'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addNode = (type, position = { x: 0, y: 0 }) => {
    if (!currentFlow.value) return null
    
    const node = {
      ...defaultNodes[type],
      id: uid(),
      position
    }

    currentFlow.value.nodes[node.id] = node
    unsavedChanges.value = true

    return node
  }

  const updateNode = (nodeId, data) => {
    if (!currentFlow.value?.nodes[nodeId]) return false

    currentFlow.value.nodes[nodeId] = {
      ...currentFlow.value.nodes[nodeId],
      ...data
    }
    unsavedChanges.value = true

    return true
  }

  const deleteNode = (nodeId) => {
    if (!currentFlow.value?.nodes[nodeId]) return false

    // Remover conexões que apontam para este nó
    Object.values(currentFlow.value.nodes).forEach(node => {
      if (node.next === nodeId) {
        node.next = null
      }
      if (node.type === 'condition') {
        if (node.next.true === nodeId) node.next.true = null
        if (node.next.false === nodeId) node.next.false = null
      }
    })

    delete currentFlow.value.nodes[nodeId]
    unsavedChanges.value = true

    return true
  }

  const connectNodes = (sourceId, targetId, port = 'next') => {
    if (!currentFlow.value?.nodes[sourceId] || !currentFlow.value?.nodes[targetId]) {
      return false
    }

    const sourceNode = currentFlow.value.nodes[sourceId]

    if (sourceNode.type === 'condition' && ['true', 'false'].includes(port)) {
      sourceNode.next[port] = targetId
    } else {
      sourceNode.next = targetId
    }

    unsavedChanges.value = true
    return true
  }

  const disconnectNodes = (sourceId, port = 'next') => {
    if (!currentFlow.value?.nodes[sourceId]) return false

    const sourceNode = currentFlow.value.nodes[sourceId]

    if (sourceNode.type === 'condition' && ['true', 'false'].includes(port)) {
      sourceNode.next[port] = null
    } else {
      sourceNode.next = null
    }

    unsavedChanges.value = true
    return true
  }

  const validateFlow = (flow = currentFlow.value) => {
    if (!flow) return { valid: false, errors: ['Fluxo não encontrado'] }

    const errors = []
    const visited = new Set()

    // Verificar nó inicial
    if (!flow.nodes.start) {
      errors.push('Nó inicial não encontrado')
    }

    // Verificar nós desconectados
    const traverse = (nodeId) => {
      if (!nodeId || visited.has(nodeId)) return
      visited.add(nodeId)

      const node = flow.nodes[nodeId]
      if (!node) return

      if (node.type === 'condition') {
        traverse(node.next.true)
        traverse(node.next.false)
      } else if (node.next) {
        traverse(node.next)
      }
    }

    traverse('start')

    Object.entries(flow.nodes).forEach(([id, node]) => {
      if (!visited.has(id) && node.type !== 'queue') {
        errors.push(`Nó "${node.name}" (${id}) está desconectado`)
      }

      // Validações específicas por tipo
      switch (node.type) {
        case 'message':
          if (!node.message?.trim()) {
            errors.push(`Nó "${node.name}" (${id}) não possui mensagem`)
          }
          break
        case 'input':
          if (!node.variable?.trim()) {
            errors.push(`Nó "${node.name}" (${id}) não possui variável`)
          }
          break
        case 'condition':
          if (!node.variable?.trim()) {
            errors.push(`Nó "${node.name}" (${id}) não possui variável`)
          }
          if (!node.next.true && !node.next.false) {
            errors.push(`Nó "${node.name}" (${id}) não possui conexões`)
          }
          break
        case 'queue':
          if (!node.queueId) {
            errors.push(`Nó "${node.name}" (${id}) não possui fila selecionada`)
          }
          break
        case 'api':
          if (!node.url?.trim()) {
            errors.push(`Nó "${node.name}" (${id}) não possui URL`)
          }
          if (!node.variable?.trim()) {
            errors.push(`Nó "${node.name}" (${id}) não possui variável`)
          }
          break
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Socket handlers
  const handleFlowUpdate = (data) => {
    const index = flows.value.findIndex(f => f.id === data.id)
    if (index !== -1) {
      flows.value[index] = data
    } else {
      flows.value.unshift(data)
    }

    if (currentFlow.value?.id === data.id) {
      currentFlow.value = data
    }
  }

  const handleFlowDelete = (flowId) => {
    flows.value = flows.value.filter(f => f.id !== flowId)
    
    if (currentFlow.value?.id === flowId) {
      currentFlow.value = null
    }
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('chatflow:update', handleFlowUpdate)
    socket.value?.on('chatflow:delete', handleFlowDelete)
  }

  const removeSocketListeners = () => {
    socket.value?.off('chatflow:update', handleFlowUpdate)
    socket.value?.off('chatflow:delete', handleFlowDelete)
  }

  // Lifecycle
  onMounted(() => {
    setupSocketListeners()
    loadFlows()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  // Watch for unsaved changes
  watch(currentFlow, () => {
    unsavedChanges.value = true
  }, { deep: true })

  return {
    // Estado
    flows,
    currentFlow,
    loading,
    error,
    unsavedChanges,

    // Computed
    activeFlows,
    flowsByQueue,

    // Constantes
    defaultNodes,

    // Métodos
    loadFlows,
    createFlow,
    updateFlow,
    deleteFlow,
    addNode,
    updateNode,
    deleteNode,
    connectNodes,
    disconnectNodes,
    validateFlow
  }
}
