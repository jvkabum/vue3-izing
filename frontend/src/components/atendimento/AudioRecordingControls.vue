<template>
  <div class="full-width items-center row justify-end">
    <!-- Indicador de Gravação -->
    <q-skeleton
      animation="pulse-y"
      class="col-grow q-mx-md recording-indicator"
      type="text"
    />

    <!-- Controles de Gravação -->
    <div class="recording-controls row items-center q-gutter-x-sm">
      <!-- Cancelar -->
      <q-btn
        flat
        round
        color="negative"
        icon="mdi-close"
        class="bg-padrao btn-rounded"
        @click="$emit('cancel')"
      >
        <q-tooltip content-class="text-bold">
          Cancelar gravação
        </q-tooltip>
      </q-btn>

      <!-- Timer -->
      <recording-timer
        class="text-bold timer"
        :class="{ 'text-white': $q.dark.isActive }"
      />

      <!-- Enviar -->
      <q-btn
        flat
        round
        color="positive"
        icon="mdi-send-circle-outline"
        class="bg-padrao btn-rounded"
        :disable="recordingTime < 1"
        @click="handleStop"
      >
        <q-tooltip content-class="text-bold">
          Enviar áudio
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import RecordingTimer from './RecordingTimer.vue'

// Props
const props = defineProps({
  isRecording: {
    type: Boolean,
    required: true
  }
})

// Emits
const emit = defineEmits(['stop', 'cancel'])

// Composables
const $q = useQuasar()

// Estado
const recordingTime = ref(0)
let timerInterval = null

// Métodos
const handleStop = () => {
  if (recordingTime.value < 1) {
    $q.notify({
      type: 'warning',
      message: 'Gravação muito curta',
      position: 'top'
    })
    return
  }
  emit('stop')
}

const startTimer = () => {
  timerInterval = setInterval(() => {
    recordingTime.value++
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  recordingTime.value = 0
}

// Lifecycle
onMounted(() => {
  if (props.isRecording) {
    startTimer()
  }
})

onUnmounted(() => {
  stopTimer()
})

// Watch
watch(() => props.isRecording, (newValue) => {
  if (newValue) {
    startTimer()
  } else {
    stopTimer()
  }
})
</script>

<style lang="scss" scoped>
.recording-indicator {
  height: 24px;
  max-width: 300px;
  border-radius: 12px;
  background: var(--q-negative);
  opacity: 0.7;
  animation: pulse 1.5s infinite;
}

.recording-controls {
  min-width: 200px;
  padding: 0 16px;
}

.timer {
  font-size: 16px;
  font-family: monospace;
  min-width: 60px;
  text-align: center;
}

.bg-padrao {
  &.q-btn {
    transition: all 0.3s ease;
    
    &:not(:disabled) {
      &:hover {
        background: rgba(var(--q-primary-rgb), 0.1);
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
    
    &:disabled {
      opacity: 0.6;
    }
  }
}

.btn-rounded {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  
  :deep(.q-icon) {
    font-size: 24px;
  }
}

@keyframes pulse {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0.4;
  }
}

:deep(.q-tooltip) {
  font-size: 14px;
  padding: 8px 12px;
  background: var(--q-primary);
}
</style>
