<template>
  <g
    :class="[
      'flow-connection',
      { 'flow-connection--selected': selected }
    ]"
    @click.stop="$emit('select', connection)"
  >
    <!-- Linha de Conexão -->
    <path
      :d="pathData"
      :class="[
        'connection-path',
        `connection-path--${connection.type || 'default'}`
      ]"
      fill="none"
      @mouseenter="showControls = true"
      @mouseleave="showControls = false"
    />

    <!-- Ponto de Controle 1 -->
    <circle
      v-if="showControls"
      :cx="controlPoint1.x"
      :cy="controlPoint1.y"
      r="4"
      class="control-point"
      @mousedown="startDragControl(1)"
    />

    <!-- Ponto de Controle 2 -->
    <circle
      v-if="showControls"
      :cx="controlPoint2.x"
      :cy="controlPoint2.y"
      r="4"
      class="control-point"
      @mousedown="startDragControl(2)"
    />

    <!-- Seta -->
    <path
      :d="arrowData"
      :class="[
        'connection-arrow',
        `connection-arrow--${connection.type || 'default'}`
      ]"
    />

    <!-- Label -->
    <g
      v-if="connection.label"
      :transform="`translate(${labelPosition.x},${labelPosition.y})`"
      class="connection-label"
    >
      <rect
        x="-40"
        y="-10"
        width="80"
        height="20"
        rx="4"
        class="label-background"
      />
      <text
        x="0"
        y="4"
        text-anchor="middle"
        class="label-text"
      >
        {{ connection.label }}
      </text>
    </g>

    <!-- Menu de Contexto -->
    <q-menu v-model="menuVisible" context-menu>
      <q-list dense>
        <q-item clickable v-close-popup @click="$emit('select', connection)">
          <q-item-section avatar>
            <q-icon name="edit" />
          </q-item-section>
          <q-item-section>Editar</q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-close-popup @click="$emit('delete', connection.id)">
          <q-item-section avatar>
            <q-icon name="delete" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">Excluir</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </g>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  connection: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'update', 'delete'])

// Estado
const menuVisible = ref(false)
const showControls = ref(false)
const isDragging = ref(false)
const draggedControl = ref(null)

// Computed
const controlPoint1 = computed(() => ({
  x: props.connection.sourcePoint.x + props.connection.controlPoint1?.x || 0,
  y: props.connection.sourcePoint.y + props.connection.controlPoint1?.y || 0
}))

const controlPoint2 = computed(() => ({
  x: props.connection.targetPoint.x + props.connection.controlPoint2?.x || 0,
  y: props.connection.targetPoint.y + props.connection.controlPoint2?.y || 0
}))

const pathData = computed(() => {
  const { sourcePoint: s, targetPoint: t } = props.connection
  const c1 = controlPoint1.value
  const c2 = controlPoint2.value

  return `M ${s.x},${s.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${t.x},${t.y}`
})

const arrowData = computed(() => {
  const { targetPoint: t } = props.connection
  const angle = Math.atan2(
    t.y - controlPoint2.value.y,
    t.x - controlPoint2.value.x
  )
  
  const size = 10
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  
  return `
    M ${t.x},${t.y}
    L ${t.x - size * dx + size * dy / 2},${t.y - size * dy - size * dx / 2}
    L ${t.x - size * dx - size * dy / 2},${t.y - size * dy + size * dx / 2}
    Z
  `
})

const labelPosition = computed(() => {
  const { sourcePoint: s, targetPoint: t } = props.connection
  return {
    x: (s.x + t.x) / 2,
    y: (s.y + t.y) / 2
  }
})

// Métodos
const startDragControl = (controlNumber) => {
  isDragging.value = true
  draggedControl.value = controlNumber

  const handleMouseMove = (e) => {
    if (!isDragging.value) return

    const rect = e.target.closest('svg').getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const updatedConnection = { ...props.connection }
    if (draggedControl.value === 1) {
      updatedConnection.controlPoint1 = {
        x: x - props.connection.sourcePoint.x,
        y: y - props.connection.sourcePoint.y
      }
    } else {
      updatedConnection.controlPoint2 = {
        x: x - props.connection.targetPoint.x,
        y: y - props.connection.targetPoint.y
      }
    }

    emit('update', updatedConnection)
  }

  const handleMouseUp = () => {
    isDragging.value = false
    draggedControl.value = null
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}
</script>

<style lang="scss">
.flow-connection {
  pointer-events: all;

  &--selected {
    .connection-path {
      stroke-width: 3;
    }
  }

  .connection-path {
    stroke: var(--q-primary);
    stroke-width: 2;
    transition: stroke-width 0.3s;

    &--success {
      stroke: var(--q-positive);
    }

    &--error {
      stroke: var(--q-negative);
    }

    &:hover {
      stroke-width: 3;
    }
  }

  .connection-arrow {
    fill: var(--q-primary);

    &--success {
      fill: var(--q-positive);
    }

    &--error {
      fill: var(--q-negative);
    }
  }

  .control-point {
    fill: white;
    stroke: var(--q-primary);
    stroke-width: 2;
    cursor: move;

    &:hover {
      fill: var(--q-primary);
    }
  }

  .connection-label {
    pointer-events: none;

    .label-background {
      fill: white;
      stroke: var(--q-primary);
      stroke-width: 1;
      opacity: 0.9;
    }

    .label-text {
      fill: var(--q-primary);
      font-size: 12px;
      user-select: none;
    }
  }
}

.dark {
  .flow-connection {
    .control-point {
      fill: $dark;
    }

    .connection-label {
      .label-background {
        fill: $dark;
      }

      .label-text {
        fill: white;
      }
    }
  }
}
</style>
