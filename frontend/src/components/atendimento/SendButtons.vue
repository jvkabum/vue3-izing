<template>
  <div class="row items-center q-gutter-x-xs">
    <!-- Botão de Enviar -->
    <q-btn
      v-if="showSend"
      ref="sendButton"
      flat
      dense
      icon="mdi-send"
      :disabled="disabled"
      class="bg-padrao btn-rounded"
      :color="$q.dark.isActive ? 'white' : ''"
      @click="$emit('send')"
    >
      <q-tooltip content-class="text-bold">
        Enviar Mensagem
      </q-tooltip>

      <!-- Atalhos de teclado -->
      <q-tooltip
        anchor="bottom middle"
        self="top middle"
        class="keyboard-shortcuts"
      >
        <div class="column items-center q-gutter-y-sm">
          <div>Enviar: Enter</div>
          <div>Nova linha: Shift + Enter</div>
        </div>
      </q-tooltip>
    </q-btn>

    <!-- Botão de Áudio -->
    <q-btn
      v-if="showAudio"
      flat
      dense
      icon="mdi-microphone"
      :disabled="actionsDisabled"
      class="bg-padrao btn-rounded"
      :color="$q.dark.isActive ? 'white' : ''"
      @click="handleStartRecording"
    >
      <q-tooltip content-class="text-bold">
        Enviar Áudio
      </q-tooltip>
    </q-btn>

    <!-- Dialog de Permissão de Microfone -->
    <q-dialog v-model="showPermissionDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="mic_off" color="negative" text-color="white" />
          <span class="q-ml-sm">Permissão de microfone necessária</span>
        </q-card-section>

        <q-card-section>
          Para gravar áudio, você precisa permitir o acesso ao microfone nas configurações do seu navegador.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
          <q-btn 
            flat 
            label="Abrir Configurações" 
            color="primary" 
            @click="openBrowserSettings"
            v-close-popup 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

// Props
const props = defineProps({
  showSend: {
    type: Boolean,
    default: false
  },
  showAudio: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  actionsDisabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['send', 'start-recording'])

// Composables
const $q = useQuasar()

// Estado
const showPermissionDialog = ref(false)

// Métodos
const handleStartRecording = async () => {
  try {
    // Verificar suporte a MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      $q.notify({
        type: 'negative',
        message: 'Seu navegador não suporta gravação de áudio',
        position: 'top'
      })
      return
    }

    // Solicitar permissão
    await navigator.mediaDevices.getUserMedia({ audio: true })
    emit('start-recording')
  } catch (error) {
    console.error('Erro ao solicitar permissão do microfone:', error)
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      showPermissionDialog.value = true
    } else {
      $q.notify({
        type: 'negative',
        message: 'Erro ao acessar microfone. Verifique as configurações do seu navegador.',
        position: 'top'
      })
    }
  }
}

const openBrowserSettings = () => {
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'microphone' })
      .then(result => {
        if (result.state === 'denied') {
          window.open('chrome://settings/content/microphone', '_blank')
        }
      })
  }
}
</script>

<style lang="scss" scoped>
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
  width: 36px;
  height: 36px;
  
  :deep(.q-icon) {
    font-size: 20px;
  }
}

.keyboard-shortcuts {
  background: var(--q-dark);
  font-size: 12px;
  padding: 8px 12px;
  
  div {
    white-space: nowrap;
  }
}

:deep(.q-dialog) {
  .q-card {
    border-radius: 8px;
    max-width: 400px;
  }
  
  .q-avatar {
    width: 32px;
    height: 32px;
  }
}
</style>
