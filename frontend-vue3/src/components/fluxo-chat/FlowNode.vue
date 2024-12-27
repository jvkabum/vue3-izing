<template>
  <div
    :class="[
      'flow-node',
      `flow-node--${node.type}`,
      { 'flow-node--selected': selected }
    ]"
    :style="nodeStyle"
    @mousedown="startDrag"
    @click.stop="$emit('select', node)"
  >
    <!-- Cabeçalho do Nó -->
    <div class="node-header">
      <q-icon :name="nodeIcon" :color="nodeColor" size="20px" />
      <div class="node-title">{{ nodeTitle }}</div>
      <q-btn
        flat
        round
        dense
        icon="more_vert"
        size="sm"
        @click.stop="showMenu"
      />
    </div>

    <!-- Conteúdo do Nó -->
    <div class="node-content">
      <template v-if="node.type === 'message'">
        <div class="message-preview">{{ node.data?.message || 'Mensagem vazia' }}</div>
      </template>

      <template v-else-if="node.type === 'condition'">
        <div class="condition-preview">
          {{ node.data?.condition || 'Condição não definida' }}
        </div>
      </template>

      <template v-else-if="node.type === 'action'">
        <div class="action-preview">
          {{ node.data?.action || 'Ação não definida' }}
        </div>
      </template>

      <template v-else-if="node.type === 'input'">
        <div class="input-preview">
          {{ node.data?.variable || 'Variável não definida' }}
        </div>
      </template>

      <template v-else-if="node.type === 'api'">
        <div class="api-preview">
          {{ node.data?.endpoint || 'Endpoint não definido' }}
        </div>
      </template>
    </div>

    <!-- Pontos de Conexão -->
    <div class="connection-points">
      <!-- Entrada -->
      <div
        v-if="showInput"
        class="connection-point connection-point--input"
        @mousedown.stop="startConnection('input')"
        @mouseup.stop="endConnection('input')"
      />

      <!-- Saídas -->
      <template v-if="showOutputs">
        <div
          v-for="(output, index) in outputs"
          :key="index"
          class="connection-point connection-point--output"
          :style="getOutputStyle(index)"
          @mousedown.stop="startConnection('output', index)"
          @mouseup.stop="endConnection('output', index)"
        >
          <span class="output-label">{{ output.label }}</span>
        </div>
      </template>
    </div>

    <!-- Menu de Contexto -->
    <q-menu v-model="menuVisible" context-menu>
      <q-list dense>
        <q-item clickable v-close-popup @click="$emit('select', node)">
          <q-item-section avatar>
            <q-icon name="edit" />
          </q-item-section>
          <q-item-section>Editar</q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="duplicateNode">
          <q-item-section avatar>
            <q-icon name="content_copy" />
          </q-item-section>
          <q-item-section>Duplicar</q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-close-popup @click="$emit('delete', node.id)">
          <q-item-section avatar>
            <q-icon name="delete" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">Excluir</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'update', 'delete', 'connection-start', 'connection-end'])

// Estado
const menuVisible = ref(false)
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })

// Computed
const nodeStyle = computed(() => ({
  transform: `translate(${props.node.position.x}px, ${props.node.position.y}px)`
}))

const nodeIcon = computed(() => {
  const icons = {
    message: 'message',
    condition: 'help',
    action: 'play_arrow',
    input: 'input',
    api: 'api'
  }
  return icons[props.node.type] || 'help_outline'
})

const nodeColor = computed(() => {
  const colors = {
    message: 'primary',
    condition: 'warning',
    action: 'positive',
    input: 'info',
    api: 'purple'
  }
  return colors[props.node.type] || 'grey'
})

const nodeTitle = computed(() => {
  const titles = {
    message: 'Mensagem',
    condition: 'Condição',
    action: 'Ação',
    input: 'Entrada',
    api: 'API'
  }
  return titles[props.node.type] || 'Nó'
})

const showInput = computed(() => props.node.type !== 'start')

const showOutputs = computed(() => props.node.type !== 'end')

const outputs = computed(() => {
  if (props.node.type === 'condition') {
    return [
      { label: 'Sim' },
      { label: 'Não' }
    ]
  }
  return [{ label: '' }]
})

// Métodos
const startDrag = (event) => {
  if (event.button !== 0) return

  isDragging.value = true
  startPos.value = {
    x: event.clientX - props.node.position.x,
    y: event.clientY - props.node.position.y
  }

  const handleMouseMove = (e) => {
    if (!isDragging.value) return

    const newPosition = {
      x: e.clientX - startPos.value.x,
      y: e.clientY - startPos.value.y
    }

    emit('update', {
      ...props.node,
      position: newPosition
    })
  }

  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const showMenu = (event) => {
  menuVisible.value = true
}

const duplicateNode = () => {
  const newNode = {
    ...props.node,
    id: `node-${Date.now()}`,
    position: {
      x: props.node.position.x + 20,
      y: props.node.position.y + 20
    }
  }
  emit('update', newNode)
}

const startConnection = (type, index) => {
  emit('connection-start', {
    nodeId: props.node.id,
    type,
    index
  })
}

const endConnection = (type, index) => {
  emit('connection-end', {
    nodeId: props.node.id,
    type,
    index
  })
}

const getOutputStyle = (index) => {
  const total = outputs.value.length
  const spacing = 100 / (total + 1)
  const position = (index + 1) * spacing

  return {
    left: `${position}%`
  }
}
</script>

<style lang="scss" scoped>
.flow-node {
  position: absolute;
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  user-select: none;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &--selected {
    box-shadow: 0 0 0 2px var(--q-primary) !important;
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);

    .node-title {
      flex: 1;
      font-weight: 500;
      font-size: 14px;
    }
  }

  .node-content {
    padding: 12px;
    min-height: 60px;

    .message-preview,
    .condition-preview,
    .action-preview,
    .input-preview,
    .api-preview {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.7);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .connection-points {
    position: absolute;
    width: 100%;
    height: 100%;

    .connection-point {
      position: absolute;
      width: 12px;
      height: 12px;
      background: var(--q-primary);
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      z-index: 1;

      &--input {
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
      }

      &--output {
        bottom: -6px;
        transform: translateX(-50%);

        .output-label {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          white-space: nowrap;
        }
      }

      &:hover {
        transform: translateX(-50%) scale(1.2);
      }
    }
  }
}

.dark {
  .flow-node {
    background: $dark;
    
    .node-header {
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }

    .node-content {
      .message-preview,
      .condition-preview,
      .action-preview,
      .input-preview,
      .api-preview {
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .connection-point {
      border-color: $dark;
    }
  }
}
</style>
