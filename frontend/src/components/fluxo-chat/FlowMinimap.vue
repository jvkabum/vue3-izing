<template>
  <div class="flow-minimap">
    <!-- Área do Minimap -->
    <svg
      :width="width"
      :height="height"
      @click="handleClick"
      @mousedown="startPan"
    >
      <!-- Background -->
      <rect
        x="0"
        y="0"
        :width="width"
        :height="height"
        class="minimap-background"
      />

      <!-- Nós -->
      <g :transform="`scale(${scale})`">
        <rect
          v-for="node in nodes"
          :key="node.id"
          :x="node.position.x * scale"
          :y="node.position.y * scale"
          :width="nodeWidth * scale"
          :height="nodeHeight * scale"
          :class="[
            'minimap-node',
            `minimap-node--${node.type}`
          ]"
        />

        <!-- Conexões -->
        <path
          v-for="connection in connections"
          :key="connection.id"
          :d="getConnectionPath(connection)"
          class="minimap-connection"
        />
      </g>

      <!-- Viewport -->
      <rect
        :x="viewportRect.x"
        :y="viewportRect.y"
        :width="viewportRect.width"
        :height="viewportRect.height"
        class="minimap-viewport"
        @mousedown.stop="startViewportDrag"
      />
    </svg>

    <!-- Controles de Zoom -->
    <div class="minimap-controls">
      <q-btn
        flat
        round
        dense
        icon="add"
        size="sm"
        @click="zoomIn"
      >
        <q-tooltip>Aumentar</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="remove"
        size="sm"
        @click="zoomOut"
      >
        <q-tooltip>Diminuir</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="center_focus_strong"
        size="sm"
        @click="fitView"
      >
        <q-tooltip>Ajustar à Tela</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  connections: {
    type: Array,
    default: () => []
  },
  viewport: {
    type: Object,
    required: true
  },
  width: {
    type: Number,
    default: 200
  },
  height: {
    type: Number,
    default: 150
  }
})

const emit = defineEmits(['navigate', 'zoom', 'fit'])

// Constantes
const nodeWidth = 200
const nodeHeight = 100
const minScale = 0.1
const maxScale = 2

// Estado
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
const currentScale = ref(1)

// Computed
const scale = computed(() => {
  // Calcula a escala baseada no tamanho do canvas e do minimap
  const bounds = getFlowBounds()
  const scaleX = props.width / (bounds.width || 1)
  const scaleY = props.height / (bounds.height || 1)
  return Math.min(scaleX, scaleY, 1)
})

const viewportRect = computed(() => {
  const s = scale.value
  return {
    x: props.viewport.x * s,
    y: props.viewport.y * s,
    width: props.viewport.width * s,
    height: props.viewport.height * s
  }
})

// Métodos
const getFlowBounds = () => {
  if (!props.nodes.length) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  const positions = props.nodes.map(node => node.position)
  const minX = Math.min(...positions.map(p => p.x))
  const minY = Math.min(...positions.map(p => p.y))
  const maxX = Math.max(...positions.map(p => p.x + nodeWidth))
  const maxY = Math.max(...positions.map(p => p.y + nodeHeight))

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

const getConnectionPath = (connection) => {
  const s = scale.value
  const start = {
    x: connection.sourcePoint.x * s,
    y: connection.sourcePoint.y * s
  }
  const end = {
    x: connection.targetPoint.x * s,
    y: connection.targetPoint.y * s
  }
  
  // Curva simples para o minimap
  const midX = (start.x + end.x) / 2
  return `M ${start.x},${start.y} Q ${midX},${start.y} ${midX},${(start.y + end.y) / 2} T ${end.x},${end.y}`
}

const handleClick = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = (event.clientX - rect.left) / scale.value
  const y = (event.clientY - rect.top) / scale.value
  
  emit('navigate', { x, y })
}

const startViewportDrag = (event) => {
  isDragging.value = true
  startPos.value = {
    x: event.clientX - viewportRect.value.x,
    y: event.clientY - viewportRect.value.y
  }

  const handleMouseMove = (e) => {
    if (!isDragging.value) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left - startPos.value.x) / scale.value
    const y = (e.clientY - rect.top - startPos.value.y) / scale.value

    emit('navigate', { x, y })
  }

  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const startPan = (event) => {
  if (event.target.classList.contains('minimap-viewport')) return

  const rect = event.currentTarget.getBoundingClientRect()
  const x = (event.clientX - rect.left) / scale.value
  const y = (event.clientY - rect.top) / scale.value

  emit('navigate', { x, y })
}

const zoomIn = () => {
  currentScale.value = Math.min(currentScale.value * 1.2, maxScale)
  emit('zoom', currentScale.value)
}

const zoomOut = () => {
  currentScale.value = Math.max(currentScale.value / 1.2, minScale)
  emit('zoom', currentScale.value)
}

const fitView = () => {
  emit('fit')
}
</script>

<style lang="scss" scoped>
.flow-minimap {
  position: relative;
  border-radius: 4px;
  overflow: hidden;

  svg {
    display: block;
  }

  .minimap-background {
    fill: var(--q-dark);
    opacity: 0.05;
  }

  .minimap-node {
    fill: var(--q-primary);
    opacity: 0.6;

    &--message {
      fill: var(--q-primary);
    }

    &--condition {
      fill: var(--q-warning);
    }

    &--action {
      fill: var(--q-positive);
    }

    &--input {
      fill: var(--q-info);
    }

    &--api {
      fill: var(--q-purple);
    }
  }

  .minimap-connection {
    stroke: var(--q-primary);
    stroke-width: 1;
    fill: none;
    opacity: 0.4;
  }

  .minimap-viewport {
    fill: none;
    stroke: var(--q-primary);
    stroke-width: 1;
    cursor: move;

    &:hover {
      stroke-width: 2;
    }
  }

  .minimap-controls {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    padding: 4px;
  }
}

.dark {
  .flow-minimap {
    .minimap-background {
      fill: white;
      opacity: 0.05;
    }

    .minimap-controls {
      background: rgba(0, 0, 0, 0.7);
    }
  }
}
</style>
