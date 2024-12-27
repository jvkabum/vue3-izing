<template>
  <div class="flow-panel">
    <div class="panel-header">
      <div class="panel-title">{{ title }}</div>
      <div class="panel-actions">
        <q-btn
          flat
          round
          dense
          icon="help"
          @click="showHelp"
        />
        <q-btn
          flat
          round
          dense
          icon="info"
          @click="showInfo"
        />
      </div>
    </div>

    <div class="panel-content">
      <node-menu class="panel-left" />

      <div class="panel-center" ref="flowContainer">
        <div
          class="flow-canvas"
          @dragover.prevent
          @drop="handleDrop"
        >
          <node
            v-for="node in nodeList"
            :key="node.id"
            :node="node"
            @delete="handleDeleteNode"
          />
        </div>
      </div>

      <div v-if="selectedNode" class="panel-right">
        <node-form
          :node="selectedNode"
          @save="handleSaveNode"
          @cancel="selectedNode = null"
        />
      </div>
    </div>

    <help-dialog ref="helpDialog" />
    <info-dialog ref="infoDialog" :data="flowData" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import NodeMenu from './node_menu.vue'
import Node from './node.vue'
import NodeForm from './node_form.vue'
import HelpDialog from './help.vue'
import InfoDialog from './info.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Fluxo de Mensagens'
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update'])

// Refs
const flowContainer = ref(null)
const helpDialog = ref(null)
const infoDialog = ref(null)

// Estado
const nodeList = ref(props.initialData.nodeList || [])
const selectedNode = ref(null)

// Computed
const flowData = computed(() => ({
  nodeList: nodeList.value,
  // Adicione outros dados necessários
}))

// Métodos
const handleDrop = (event) => {
  const nodeData = JSON.parse(event.dataTransfer.getData('nodeData'))
  const rect = flowContainer.value.getBoundingClientRect()
  
  const newNode = {
    id: uuidv4(),
    ...nodeData,
    left: `${event.clientX - rect.left}px`,
    top: `${event.clientY - rect.top}px`
  }

  nodeList.value.push(newNode)
  emit('update', flowData.value)
}

const handleDeleteNode = (node) => {
  const index = nodeList.value.findIndex(n => n.id === node.id)
  if (index !== -1) {
    nodeList.value.splice(index, 1)
    emit('update', flowData.value)
  }
}

const handleSaveNode = (updatedNode) => {
  const index = nodeList.value.findIndex(n => n.id === updatedNode.id)
  if (index !== -1) {
    nodeList.value[index] = updatedNode
    selectedNode.value = null
    emit('update', flowData.value)
  }
}

const showHelp = () => {
  helpDialog.value?.init()
}

const showInfo = () => {
  infoDialog.value?.init()
}
</script>

<style lang="scss" scoped>
.flow-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #ddd;

    .panel-title {
      font-size: 18px;
      font-weight: 500;
    }

    .panel-actions {
      display: flex;
      gap: 8px;
    }
  }

  .panel-content {
    display: flex;
    flex: 1;
    overflow: hidden;

    .panel-left {
      width: 250px;
      border-right: 1px solid #ddd;
    }

    .panel-center {
      flex: 1;
      position: relative;
      overflow: auto;

      .flow-canvas {
        position: absolute;
        width: 100%;
        height: 100%;
        min-width: 2000px;
        min-height: 2000px;
      }
    }

    .panel-right {
      width: 300px;
      border-left: 1px solid #ddd;
      background: #f5f5f5;
    }
  }
}
</style>
