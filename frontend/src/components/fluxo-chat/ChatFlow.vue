<template>
  <div class="chat-flow">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Fluxo de Chat</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="add"
          label="Novo Fluxo"
          @click="createNewFlow"
        />
        <q-btn-dropdown color="secondary" label="Ações">
          <q-list>
            <q-item clickable v-close-popup @click="importFlow">
              <q-item-section avatar>
                <q-icon name="upload_file" />
              </q-item-section>
              <q-item-section>Importar Fluxo</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportFlow">
              <q-item-section avatar>
                <q-icon name="download" />
              </q-item-section>
              <q-item-section>Exportar Fluxo</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Área do Fluxo -->
    <div class="flow-container">
      <!-- Barra Lateral de Nós -->
      <div class="nodes-sidebar">
        <div class="text-subtitle2 q-mb-sm">Elementos</div>
        <div class="nodes-list q-gutter-y-sm">
          <div
            v-for="nodeType in nodeTypes"
            :key="nodeType.type"
            class="node-item"
            draggable="true"
            @dragstart="handleDragStart($event, nodeType)"
          >
            <q-icon :name="nodeType.icon" size="24px" :color="nodeType.color" />
            <div class="node-label">{{ nodeType.label }}</div>
          </div>
        </div>
      </div>

      <!-- Área de Desenho do Fluxo -->
      <div
        ref="flowCanvas"
        class="flow-canvas"
        @dragover="handleDragOver"
        @drop="handleDrop"
      >
        <!-- Nós do Fluxo -->
        <flow-node
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          :selected="selectedNode?.id === node.id"
          @select="selectNode"
          @update="updateNode"
          @delete="deleteNode"
        />

        <!-- Conexões -->
        <svg class="connections-layer">
          <flow-connection
            v-for="connection in connections"
            :key="connection.id"
            :connection="connection"
            :selected="selectedConnection?.id === connection.id"
            @select="selectConnection"
            @delete="deleteConnection"
          />
        </svg>

        <!-- Minimap -->
        <div class="minimap">
          <flow-minimap
            :nodes="nodes"
            :connections="connections"
            :viewport="viewport"
            @navigate="navigateToPosition"
          />
        </div>
      </div>

      <!-- Painel de Propriedades -->
      <div v-if="selectedNode || selectedConnection" class="properties-panel">
        <div class="text-subtitle2 q-mb-sm">
          {{ selectedNode ? 'Propriedades do Nó' : 'Propriedades da Conexão' }}
        </div>

        <!-- Propriedades do Nó -->
        <template v-if="selectedNode">
          <node-properties
            :node="selectedNode"
            @update="updateNodeProperties"
          />
        </template>

        <!-- Propriedades da Conexão -->
        <template v-if="selectedConnection">
          <connection-properties
            :connection="selectedConnection"
            @update="updateConnectionProperties"
          />
        </template>
      </div>
    </div>

    <!-- Barra de Ferramentas -->
    <div class="toolbar">
      <q-btn-group flat>
        <q-btn
          icon="undo"
          :disable="!canUndo"
          @click="undo"
        >
          <q-tooltip>Desfazer</q-tooltip>
        </q-btn>
        <q-btn
          icon="redo"
          :disable="!canRedo"
          @click="redo"
        >
          <q-tooltip>Refazer</q-tooltip>
        </q-btn>
      </q-btn-group>

      <q-space />

      <q-btn-group flat>
        <q-btn
          icon="zoom_in"
          @click="zoomIn"
        >
          <q-tooltip>Aumentar Zoom</q-tooltip>
        </q-btn>
        <q-btn
          icon="zoom_out"
          @click="zoomOut"
        >
          <q-tooltip>Diminuir Zoom</q-tooltip>
        </q-btn>
        <q-btn
          icon="center_focus_strong"
          @click="fitView"
        >
          <q-tooltip>Ajustar à Tela</q-tooltip>
        </q-btn>
      </q-btn-group>

      <q-space />

      <q-btn
        color="primary"
        icon="save"
        label="Salvar"
        @click="saveFlow"
      />
    </div>

    <!-- Dialogs -->
    <flow-settings-dialog
      v-model="showSettingsDialog"
      :flow="currentFlow"
      @save="saveFlowSettings"
    />

    <q-dialog v-model="showImportDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Importar Fluxo</div>
        </q-card-section>

        <q-card-section>
          <q-file
            v-model="importFile"
            label="Selecione o arquivo JSON"
            accept=".json"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            label="Importar"
            color="primary"
            :disable="!importFile"
            @click="handleImport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useFlowBuilder } from '../../composables/fluxo/useFlowBuilder'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import FlowNode from './FlowNode.vue'
import FlowConnection from './FlowConnection.vue'
import FlowMinimap from './FlowMinimap.vue'
import NodeProperties from './NodeProperties.vue'
import ConnectionProperties from './ConnectionProperties.vue'
import FlowSettingsDialog from './FlowSettingsDialog.vue'

// Composables
const {
  currentFlow,
  nodes,
  connections,
  selectedNode,
  selectedConnection,
  viewport,
  history,
  saveFlow: saveFlowData,
  loadFlow,
  exportFlow: exportFlowData,
  importFlow: importFlowData
} = useFlowBuilder()

const { notifySuccess, notifyError } = useNotificationSystem()

// Estado
const flowCanvas = ref(null)
const showSettingsDialog = ref(false)
const showImportDialog = ref(false)
const importFile = ref(null)

// Tipos de Nós
const nodeTypes = [
  {
    type: 'message',
    label: 'Mensagem',
    icon: 'message',
    color: 'primary'
  },
  {
    type: 'condition',
    label: 'Condição',
    icon: 'help',
    color: 'warning'
  },
  {
    type: 'action',
    label: 'Ação',
    icon: 'play_arrow',
    color: 'positive'
  },
  {
    type: 'input',
    label: 'Entrada',
    icon: 'input',
    color: 'info'
  },
  {
    type: 'api',
    label: 'API',
    icon: 'api',
    color: 'purple'
  }
]

// Computed
const canUndo = computed(() => history.value.canUndo)
const canRedo = computed(() => history.value.canRedo)

// Métodos
const createNewFlow = () => {
  showSettingsDialog.value = true
}

const saveFlowSettings = async (settings) => {
  try {
    await saveFlowData(settings)
    showSettingsDialog.value = false
    notifySuccess('Configurações salvas com sucesso')
  } catch (err) {
    notifyError('Erro ao salvar configurações')
  }
}

const handleDragStart = (event, nodeType) => {
  event.dataTransfer.setData('nodeType', JSON.stringify(nodeType))
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  event.preventDefault()
  const nodeType = JSON.parse(event.dataTransfer.getData('nodeType'))
  const rect = flowCanvas.value.getBoundingClientRect()
  const position = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  
  addNode(nodeType, position)
}

const addNode = (nodeType, position) => {
  const node = {
    id: `node-${Date.now()}`,
    type: nodeType.type,
    position,
    data: {}
  }
  nodes.value.push(node)
}

const selectNode = (node) => {
  selectedNode.value = node
  selectedConnection.value = null
}

const updateNode = (node) => {
  const index = nodes.value.findIndex(n => n.id === node.id)
  if (index !== -1) {
    nodes.value[index] = node
  }
}

const deleteNode = (nodeId) => {
  nodes.value = nodes.value.filter(n => n.id !== nodeId)
  connections.value = connections.value.filter(
    c => c.source !== nodeId && c.target !== nodeId
  )
}

const selectConnection = (connection) => {
  selectedConnection.value = connection
  selectedNode.value = null
}

const updateConnection = (connection) => {
  const index = connections.value.findIndex(c => c.id === connection.id)
  if (index !== -1) {
    connections.value[index] = connection
  }
}

const deleteConnection = (connectionId) => {
  connections.value = connections.value.filter(c => c.id !== connectionId)
}

const updateNodeProperties = (properties) => {
  if (selectedNode.value) {
    updateNode({
      ...selectedNode.value,
      data: properties
    })
  }
}

const updateConnectionProperties = (properties) => {
  if (selectedConnection.value) {
    updateConnection({
      ...selectedConnection.value,
      data: properties
    })
  }
}

const navigateToPosition = (position) => {
  // Implementar navegação do viewport
}

const zoomIn = () => {
  // Implementar zoom in
}

const zoomOut = () => {
  // Implementar zoom out
}

const fitView = () => {
  // Implementar ajuste de view
}

const undo = () => {
  history.value.undo()
}

const redo = () => {
  history.value.redo()
}

const saveFlow = async () => {
  try {
    await saveFlowData()
    notifySuccess('Fluxo salvo com sucesso')
  } catch (err) {
    notifyError('Erro ao salvar fluxo')
  }
}

const importFlow = () => {
  showImportDialog.value = true
}

const handleImport = async () => {
  if (!importFile.value) return

  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const content = JSON.parse(e.target.result)
      await importFlowData(content)
      showImportDialog.value = false
      notifySuccess('Fluxo importado com sucesso')
    }
    reader.readAsText(importFile.value)
  } catch (err) {
    notifyError('Erro ao importar fluxo')
  }
}

const exportFlow = async () => {
  try {
    await exportFlowData()
    notifySuccess('Fluxo exportado com sucesso')
  } catch (err) {
    notifyError('Erro ao exportar fluxo')
  }
}

// Lifecycle
onMounted(() => {
  loadFlow()
})

onBeforeUnmount(() => {
  // Cleanup se necessário
})
</script>

<style lang="scss" scoped>
.chat-flow {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .flow-container {
    flex: 1;
    display: flex;
    gap: 20px;
    min-height: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }

  .nodes-sidebar {
    width: 200px;
    padding: 16px;
    border-right: 1px solid rgba(0, 0, 0, 0.12);

    .node-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 4px;
      cursor: move;
      transition: background-color 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      .node-label {
        font-size: 14px;
      }
    }
  }

  .flow-canvas {
    flex: 1;
    position: relative;
    overflow: hidden;

    .connections-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .minimap {
      position: absolute;
      bottom: 16px;
      right: 16px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .properties-panel {
    width: 300px;
    padding: 16px;
    border-left: 1px solid rgba(0, 0, 0, 0.12);
    overflow-y: auto;
  }

  .toolbar {
    display: flex;
    align-items: center;
    padding: 8px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }
}

.dark {
  .flow-container {
    background: $dark;
  }

  .nodes-sidebar {
    border-right-color: rgba(255, 255, 255, 0.12);

    .node-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  .properties-panel {
    border-left-color: rgba(255, 255, 255, 0.12);
  }

  .toolbar {
    background: $dark;
  }

  .minimap {
    background: $dark;
  }
}
</style>
