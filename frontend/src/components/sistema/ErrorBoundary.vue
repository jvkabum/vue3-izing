<template>
  <div class="error-boundary">
    <slot v-if="!hasError" />
    <q-card v-else class="error-card">
      <q-card-section>
        <div class="row items-center">
          <q-icon
            name="error"
            color="negative"
            size="2em"
            class="q-mr-md"
          />
          <div class="text-h6">{{ title || 'Ocorreu um erro' }}</div>
        </div>

        <q-separator class="q-my-md" />

        <div class="error-message q-mb-md">
          {{ errorMessage }}
        </div>

        <!-- Error Details (if debug mode) -->
        <q-expansion-item
          v-if="debug && errorDetails"
          label="Detalhes técnicos"
          class="q-mb-md"
        >
          <q-card>
            <q-card-section>
              <pre class="error-details">{{ JSON.stringify(errorDetails, null, 2) }}</pre>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <!-- Action Buttons -->
        <div class="row q-gutter-sm justify-end">
          <q-btn
            v-if="showReloadButton"
            label="Recarregar Página"
            icon="refresh"
            color="warning"
            @click="reloadPage"
          />
          <q-btn
            :label="retryButtonLabel"
            icon="replay"
            :color="retryButtonColor"
            @click="handleRetry"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Error Stack Dialog -->
    <q-dialog v-model="showErrorStack">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Histórico de Erros</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-timeline color="negative">
            <q-timeline-entry
              v-for="(error, index) in errorStack"
              :key="index"
              :title="error.message"
              :subtitle="formatDate(error.timestamp)"
              icon="error"
              color="negative"
            >
              <div v-if="error.componentInfo" class="text-caption">
                Componente: {{ error.componentInfo.component }}
              </div>
              <pre v-if="debug && error.stack" class="error-stack">{{ error.stack }}</pre>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Limpar Histórico"
            color="negative"
            @click="clearErrorStack"
          />
          <q-btn
            flat
            label="Fechar"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useErrorBoundary } from '../composables/useErrorBoundary'
import { format } from 'date-fns'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  debug: {
    type: Boolean,
    default: process.env.NODE_ENV === 'development'
  },
  showReloadButton: {
    type: Boolean,
    default: true
  },
  retryButtonLabel: {
    type: String,
    default: 'Tentar Novamente'
  },
  retryButtonColor: {
    type: String,
    default: 'primary'
  },
  logErrors: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['retry', 'error'])

const showErrorStack = ref(false)

const {
  hasError,
  errorMessage,
  errorDetails,
  errorStack,
  setError,
  resetError,
  clearErrorStack
} = useErrorBoundary({
  onError: (error) => emit('error', error),
  logErrors: props.logErrors
})

// Methods
const handleRetry = () => {
  emit('retry')
  resetError()
}

const reloadPage = () => {
  window.location.reload()
}

const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm:ss')
}

// Expose methods
defineExpose({
  setError,
  resetError,
  clearErrorStack,
  showErrorStack: () => { showErrorStack.value = true }
})
</script>

<style lang="scss" scoped>
.error-boundary {
  width: 100%;
  
  .error-card {
    max-width: 600px;
    margin: 0 auto;
  }

  .error-message {
    white-space: pre-wrap;
    word-break: break-word;
  }

  .error-details,
  .error-stack {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-family: monospace;
    font-size: 0.9em;
    margin: 0;
  }

  // Dark mode support
  :deep(.q-dark) {
    .error-details,
    .error-stack {
      background: #1d1d1d;
    }
  }
}

// Animations
.error-card {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive
@media (max-width: 599px) {
  .error-boundary {
    .error-card {
      margin: 1rem;
    }
    
    .text-h6 {
      font-size: 1.1rem;
    }
  }
}
</style>
