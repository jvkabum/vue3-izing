<template>
  <div class="message-actions row items-center q-gutter-x-xs">
    <!-- Anexar Arquivo -->
    <q-btn
      v-bind="buttonConfig"
      icon="mdi-paperclip"
      :disable="disabled"
      @click="$emit('attach-file')"
    >
      <q-tooltip v-bind="tooltipConfig">
        Anexar arquivo (Ctrl + A)
      </q-tooltip>
    </q-btn>

    <!-- Emoji -->
    <q-btn
      v-bind="buttonConfig"
      icon="mdi-emoticon-happy-outline"
      :disable="disabled"
    >
      <q-tooltip v-bind="tooltipConfig">
        Inserir emoji (Ctrl + E)
      </q-tooltip>
      
      <q-menu v-bind="emojiMenuConfig">
        <v-emoji-picker
          v-bind="emojiPickerConfig"
          @select="$emit('emoji-select', $event)"
        />
      </q-menu>
    </q-btn>

    <!-- Link de Vídeo -->
    <q-btn
      v-bind="buttonConfig"
      icon="mdi-message-video"
      :disable="disabled"
      @click="handleVideoClick"
    >
      <q-tooltip v-bind="tooltipConfig">
        Enviar link para videoconferência (Ctrl + V)
      </q-tooltip>
    </q-btn>

    <!-- Assinatura -->
    <div class="signature-container">
      <q-toggle
        v-model="signModel"
        keep-color
        dense
        class="signature-toggle q-mx-sm q-ml-md"
        :color="signModel ? 'positive' : 'black'"
      />
      <q-icon 
        :name="signModel ? 'mdi-signature' : 'mdi-signature-text'" 
        size="20px"
        class="signature-icon"
      />
      <q-tooltip v-bind="tooltipConfig">
        {{ signModel ? 'Desativar' : 'Ativar' }} assinatura (Ctrl + S)
      </q-tooltip>
    </div>

    <!-- Atalhos de Teclado -->
    <q-btn
      v-bind="buttonConfig"
      icon="mdi-keyboard"
      class="lt-md"
    >
      <q-tooltip v-bind="tooltipConfig">
        Atalhos de teclado
      </q-tooltip>

      <q-menu anchor="bottom middle" self="top middle">
        <q-list style="min-width: 200px">
          <q-item>
            <q-item-section>
              <div class="row items-center justify-between">
                <span>Anexar arquivo</span>
                <kbd>Ctrl + A</kbd>
              </div>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <div class="row items-center justify-between">
                <span>Inserir emoji</span>
                <kbd>Ctrl + E</kbd>
              </div>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <div class="row items-center justify-between">
                <span>Link de vídeo</span>
                <kbd>Ctrl + V</kbd>
              </div>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <div class="row items-center justify-between">
                <span>Assinatura</span>
                <kbd>Ctrl + S</kbd>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup>
/**
 * Componente de botões de ação para mensagens
 * @component
 * @description Fornece botões para ações comuns em mensagens com atalhos de teclado
 */

import { computed, onMounted, onUnmounted } from 'vue'
import { VEmojiPicker } from 'v-emoji-picker'
import { useMessageActions } from '../../composables/chat/useMessageActions'

/**
 * Props do componente
 */
const props = defineProps({
  /** Estado desabilitado */
  disabled: {
    type: Boolean,
    default: false
  },
  /** Estado da assinatura */
  sign: {
    type: Boolean,
    default: false
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits([
  'attach-file',
  'emoji-select',
  'video-link',
  'toggle-sign'
])

/**
 * Composable de ações
 */
const {
  emojiPickerConfig,
  buttonConfig,
  tooltipConfig,
  emojiMenuConfig,
  handleVideoClick: onVideoClick
} = useMessageActions()

/**
 * Model da assinatura
 */
const signModel = computed({
  get: () => props.sign,
  set: (value) => emit('toggle-sign', value)
})

/**
 * Manipula clique no botão de vídeo
 */
const handleVideoClick = async () => {
  if (props.disabled) return
  const link = await onVideoClick()
  emit('video-link', link)
}

/**
 * Manipula atalhos de teclado
 */
const handleKeydown = (event) => {
  if (props.disabled) return
  if (!event.ctrlKey) return

  switch (event.key.toLowerCase()) {
    case 'a':
      event.preventDefault()
      emit('attach-file')
      break
    case 'e':
      event.preventDefault()
      // Abrir emoji picker
      break
    case 'v':
      event.preventDefault()
      handleVideoClick()
      break
    case 's':
      event.preventDefault()
      emit('toggle-sign', !props.sign)
      break
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.message-actions {
  // Botões
  .bg-padrao {
    &.q-btn {
      transition: all 0.3s ease;
      
      &:not(:disabled) {
        &:hover {
          background: rgba(var(--q-primary-rgb), 0.1);
          transform: translateY(-1px);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
      
      &:disabled {
        opacity: 0.6;
      }
    }
  }

  // Botões arredondados
  .btn-rounded {
    border-radius: 50%;
    width: 36px;
    height: 36px;
    
    :deep(.q-icon) {
      font-size: 20px;
    }
  }

  // Container de assinatura
  .signature-container {
    display: flex;
    align-items: center;
    padding: 0 8px;

    .signature-toggle {
      :deep(.q-toggle__inner) {
        &:before {
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .q-toggle__thumb {
          border-radius: 50%;
          transition: all 0.3s ease;
        }
      }
      
      &--checked {
        :deep(.q-toggle__inner) {
          background: var(--q-positive);
          
          .q-toggle__thumb {
            background: white;
          }
        }
      }

      &:hover {
        :deep(.q-toggle__inner) {
          opacity: 0.9;
        }
      }
    }

    .signature-icon {
      margin-left: 4px;
      transition: all 0.3s ease;
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }

  // Atalhos de teclado
  kbd {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    padding: 2px 6px;
    font-family: monospace;
    font-size: 0.9em;
    margin-left: 8px;
  }
}

// Tema escuro
:deep(.body--dark) {
  .message-actions {
    .bg-padrao.q-btn:not(:disabled):hover {
      background: rgba(255, 255, 255, 0.1);
    }

    kbd {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

// Emoji picker
:deep(.v-emoji-picker) {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  .body--dark & {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }
}

// Animações
.jump-down-enter-active,
.jump-down-leave-active,
.jump-up-enter-active,
.jump-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.jump-down-enter-from,
.jump-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.jump-down-leave-to,
.jump-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

// Responsividade
@media (min-width: 600px) {
  .lt-md {
    display: none;
  }
}
</style>
