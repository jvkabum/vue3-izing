import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export function useFlowBuilderState(initialData = {}) {
  // Estado
  const nodes = ref(initialData.nodes || [])
  const connections = ref(initialData.connections || [])
  const selectedNode = ref(null)
  const selectedConnection = ref(null)
  const isModified = ref(false)

  // Computed
  const flowData = computed(() => ({
    nodes: nodes.value,
    connections: connections.value
  }))

  const nodeTypes = computed(() => ({
    start: {
      name: 'Início',
      icon: 'mdi-play-circle',
      color: '#4CAF50',
      unique: true
    },
    message: {
      name: 'Mensagem',
      icon: 'mdi-message',
      color: '#2196F3'
    },
    condition: {
      name: 'Condição',
      icon: 'mdi-help-rhombus',
      color: '#FFC107'
    },
    action: {
      name: 'Ação',
      icon: 'mdi-cog',
      color: '#9C27B0'
    },
    end: {
      name: 'Fim',
      icon: 'mdi-stop-circle',
      color: '#F44336',
      unique: true
    }
  }))

  // Métodos
  const addNode = (type, position) => {
    // Verificar se o tipo é único e já existe
    if (nodeTypes.value[type].unique) {
      const exists = nodes.value.find(n => n.type === type)
      if (exists) return null
    }

    const node = {
      id: uuidv4(),
      type,
      name: nodeTypes.value[type].name,
      icon: nodeTypes.value[type].icon,
      color: nodeTypes.value[type].color,
      position,
      data: {}
    }

    nodes.value.push(node)
    isModified.value = true
    return node
  }

  const updateNode = (nodeId, data) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      Object.assign(node, data)
      isModified.value = true
    }
  }

  const removeNode = (nodeId) => {
    // Remover conexões relacionadas
    connections.value = connections.value.filter(
      c => c.source !== nodeId && c.target !== nodeId
    )

    // Remover nó
    nodes.value = nodes.value.filter(n => n.id !== nodeId)
    isModified.value = true

    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = null
    }
  }

  const addConnection = (source, target, data = {}) => {
    // Evitar conexões duplicadas
    const exists = connections.value.find(
      c => c.source === source && c.target === target
    )
    if (exists) return null

    const connection = {
      id: uuidv4(),
      source,
      target,
      data
    }

    connections.value.push(connection)
    isModified.value = true
    return connection
  }

  const updateConnection = (connectionId, data) => {
    const connection = connections.value.find(c => c.id === connectionId)
    if (connection) {
      Object.assign(connection.data, data)
      isModified.value = true
    }
  }

  const removeConnection = (connectionId) => {
    connections.value = connections.value.filter(c => c.id !== connectionId)
    isModified.value = true

    if (selectedConnection.value?.id === connectionId) {
      selectedConnection.value = null
    }
  }

  const selectNode = (node) => {
    selectedNode.value = node
    selectedConnection.value = null
  }

  const selectConnection = (connection) => {
    selectedConnection.value = connection
    selectedNode.value = null
  }

  const clearSelection = () => {
    selectedNode.value = null
    selectedConnection.value = null
  }

  const validateFlow = () => {
    const errors = []

    // Verificar se existe nó inicial
    const hasStart = nodes.value.some(n => n.type === 'start')
    if (!hasStart) {
      errors.push('O fluxo deve ter um nó inicial')
    }

    // Verificar se existe nó final
    const hasEnd = nodes.value.some(n => n.type === 'end')
    if (!hasEnd) {
      errors.push('O fluxo deve ter um nó final')
    }

    // Verificar nós desconectados
    nodes.value.forEach(node => {
      const hasConnection = connections.value.some(
        c => c.source === node.id || c.target === node.id
      )
      if (!hasConnection && node.type !== 'end') {
        errors.push(`O nó "${node.name}" está desconectado`)
      }
    })

    return errors
  }

  const resetModified = () => {
    isModified.value = false
  }

  return {
    // Estado
    nodes,
    connections,
    selectedNode,
    selectedConnection,
    isModified,

    // Computed
    flowData,
    nodeTypes,

    // Métodos
    addNode,
    updateNode,
    removeNode,
    addConnection,
    updateConnection,
    removeConnection,
    selectNode,
    selectConnection,
    clearSelection,
    validateFlow,
    resetModified
  }
}
