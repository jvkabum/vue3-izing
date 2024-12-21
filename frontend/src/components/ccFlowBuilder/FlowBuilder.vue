<template>
  <div class="flow-builder">
    <!-- Toolbar -->
    <div class="toolbar">
      <q-btn-group flat>
        <q-btn
          flat
          round
          icon="undo"
          :disable="!isModified"
          @click="handleUndo"
        >
          <q-tooltip>Desfazer</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="redo"
          :disable="!canRedo"
          @click="handleRedo"
        >
          <q-tooltip>Refazer</q-tooltip>
        </q-btn>
      </q-btn-group>

      <q-space />

      <q-btn-group flat>
        <q-btn
          flat
          round
          icon="save"
          :disable="!isModified"
          @click="handleSave"
        >
          <q-tooltip>Salvar</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="play_arrow"
          @click="handleValidate"
        >
          <q-tooltip>Validar Fluxo</q-tooltip>
        </q-btn>
      </q-btn-group>
    </div>

    <!-- Área Principal -->
    <div class="main-area">
      <!-- Menu Lateral -->
      <div class="node-types">
        <div
          v-for="(type, key) in nodeTypes"
          :key="key"
          class="node-type-item"
          draggable="true"
          @dragstart="handleDragStart($event, key)"
        >
          <q-icon :name="type.icon" :color="type.color" size="24px" />
          <span>{{ type.name }}</span>
        </div>
      </div>

      <!-- Área do Flow -->
      <div
        ref="flowArea"
        class="flow-area"
        @dragover.prevent
        @drop="handleDrop"
        @click="clearSelection"
      >
        <!-- Nós -->
        <div
          v-for="node in nodes"
          :key="node.id"
          :id="node.id"
          class="flow-node"
          :class="{ selected: selectedNode?.id === node.id }"
          :style="getNodeStyle(node)"
          @click.stop="selectNode(node)"
        >
          <q-icon :name="node.icon" :color="node.color" size="24px" />
          <span>{{ node.name }}</span>
          <q-btn
            v-if="!node.type.unique"
            flat
            round
            dense
            icon="close"
            class="delete-btn"
            @click.stop="removeNode(node.id)"
          />
        </div>
      </div>

      <!-- Painel Lateral -->
      <div v-if="selectedNode || selectedConnection" class="side-panel">
        <template v-if="selectedNode">
          <div class="panel-header">
            <h4>Configurar {{ selectedNode.name }}</h4>
            <q-btn flat round dense icon="close" @click="clearSelection" />
          </div>
          <node-config
            :node="selectedNode"
            @update="updateNode"
          />
        </template>

        <template v-else-if="selectedConnection">
          <div class="panel-header">
            <h4>Configurar Conexão</h4>
            <q-btn flat round dense icon="close" @click="clearSelection" />
          </div>
          <connection-config
            :connection="selectedConnection"
            @update="updateConnection"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useFlowBuilder } from '../../composables/useFlowBuilder'
import { useFlowBuilderState } from '../../composables/useFlowBuilderState'
import NodeConfig from './NodeConfig.vue'
import ConnectionConfig from './ConnectionConfig.vue'
import jsPlumb from 'jsplumb'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update', 'save'])

// Composables
const $q = useQuasar()
const { jsplumbSetting, jsplumbConnectOptions } = useFlowBuilder()
const {
  nodes,
  connections,
  selectedNode,
  selectedConnection,
  isModified,
  nodeTypes,
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
} = useFlowBuilderState(props.initialData)

// Refs
const flowArea = ref(null)
let jsPlumbInstance = null

// Métodos
const initJsPlumb = () => {
  jsPlumbInstance = jsPlumb.getInstance()
  jsPlumbInstance.setContainer(flowArea.value)
  jsPlumbInstance.importDefaults(jsplumbSetting)

  // Eventos
  jsPlumbInstance.bind('connection', (info) => {
    const connection = addConnection(
      info.sourceId,
      info.targetId,
      { label: 'Nova conexão' }
    )
    if (connection) {
      info.connection.id = connection.id
    } else {
      jsPlumbInstance.deleteConnection(info.connection)
    }
  })

  jsPlumbInstance.bind('connectionDetached', (info) => {
    removeConnection(info.connection.id)
  })

  jsPlumbInstance.bind('connectionMoved', (info) => {
    removeConnection(info.originalSourceId + '_' + info.originalTargetId)
  })
}

const handleDragStart = (event, type) => {
  event.dataTransfer.setData('nodeType', type)
}

const handleDrop = (event) => {
  const type = event.dataTransfer.getData('nodeType')
  const rect = flowArea.value.getBoundingClientRect()
  const position = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  const node = addNode(type, position)
  if (node) {
    setupNode(node)
  } else {
    $q.notify({
      type: 'warning',
      message: 'Não é possível adicionar mais de um nó deste tipo'
    })
  }
}

const setupNode = (node) => {
  if (!jsPlumbInstance) return

  // Tornar o nó draggable
  jsPlumbInstance.draggable(node.id, {
    grid: [10, 10],
    stop: (event) => {
      updateNode(node.id, {
        position: {
          x: parseInt(event.pos[0]),
          y: parseInt(event.pos[1])
        }
      })
    }
  })

  // Configurar endpoints
  jsPlumbInstance.makeSource(node.id, jsplumbConnectOptions)
  jsPlumbInstance.makeTarget(node.id, jsplumbConnectOptions)
}

const getNodeStyle = (node) => ({
  left: `${node.position.x}px`,
  top: `${node.position.y}px`,
  borderColor: node.color
})

const handleSave = () => {
  const errors = validateFlow()
  if (errors.length > 0) {
    $q.dialog({
      title: 'Erros no Fluxo',
      message: errors.join('\n'),
      ok: 'OK'
    })
    return
  }

  emit('save', { nodes: nodes.value, connections: connections.value })
  resetModified()
}

const handleValidate = () => {
  const errors = validateFlow()
  if (errors.length > 0) {
    $q.dialog({
      title: 'Erros no Fluxo',
      message: errors.join('\n'),
      ok: 'OK'
    })
  } else {
    $q.notify({
      type: 'positive',
      message: 'Fluxo válido!'
    })
  }
}

// Lifecycle
onMounted(() => {
  initJsPlumb()
  nodes.value.forEach(setupNode)
})

onUnmounted(() => {
  if (jsPlumbInstance) {
    jsPlumbInstance.destroy()
  }
})
</script>

<style lang="scss" scoped>
.flow-builder {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;

  .toolbar {
    display: flex;
    align-items: center;
    padding: 8px;
    background: white;
    border-bottom: 1px solid #ddd;
  }

  .main-area {
    display: flex;
    flex: 1;
    overflow: hidden;

    .node-types {
      width: 200px;
      padding: 16px;
      background: white;
      border-right: 1px solid #ddd;
      overflow-y: auto;

      .node-type-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        margin-bottom: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: move;

        &:hover {
          background: #f5f5f5;
        }
      }
    }

    .flow-area {
      flex: 1;
      position: relative;
      overflow: auto;
      min-height: 1000px;
      min-width: 1000px;

      .flow-node {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: white;
        border: 2px solid;
        border-radius: 4px;
        cursor: move;
        user-select: none;

        &.selected {
          box-shadow: 0 0 0 2px #1976d2;
        }

        .delete-btn {
          opacity: 0;
          transition: opacity 0.2s;
        }

        &:hover .delete-btn {
          opacity: 1;
        }
      }
    }

    .side-panel {
      width: 300px;
      background: white;
      border-left: 1px solid #ddd;
      overflow-y: auto;

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid #ddd;

        h4 {
          margin: 0;
        }
      }
    }
  }
}

// jsPlumb styles
:deep {
  .jtk-connector {
    z-index: 1;
    cursor: pointer;

    &.jtk-hover {
      z-index: 2;
    }
  }

  .jtk-endpoint {
    z-index: 3;
    cursor: pointer;
  }

  .jtk-overlay {
    z-index: 4;
    background: white;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
}
</style>
