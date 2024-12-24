<template>
  <div class="message-input-field">
    <!-- Campo de Input -->
    <q-input
      ref="inputRef"
      v-model="modelValue"
      hide-bottom-space
      :loading="loading"
      :disable="disabled"
      type="textarea"
      class="input-field"
      bg-color="grey-2"
      color="grey-7"
      placeholder="Digite sua mensagem..."
      input-style="max-height: 30vh"
      autogrow
      rounded
      dense
      outlined
      @update:model-value="$emit('update:modelValue', $event)"
      @keydown.enter.exact.prevent="() => handleEnterPress(modelValue)"
      @paste="$emit('paste', $event)"
    >
      <!-- Botões Mobile -->
      <template #prepend v-if="$q.screen.lt.sm">
        <q-btn
          flat
          icon="mdi-emoticon-happy-outline"
          :disable="disabled"
          dense
          round
          class="action-btn"
          v-bind="buttonConfig"
        >
          <q-tooltip v-bind="tooltipConfig">
            Inserir emoji
          </q-tooltip>

          <q-menu v-bind="emojiMenuConfig">
            <v-emoji-picker
              v-bind="emojiPickerConfig"
              @select="(emoji) => insertEmoji(emoji, modelValue)"
            />
          </q-menu>
        </q-btn>
      </template>

      <!-- Botões Append -->
      <template #append>
        <!-- Anexar Arquivo (Mobile) -->
        <q-btn
          v-if="$q.screen.lt.sm"
          flat
          icon="mdi-paperclip"
          :disable="disabled"
          dense
          round
          class="action-btn"
          v-bind="buttonConfig"
          @click="$emit('attach-file')"
        >
          <q-tooltip v-bind="tooltipConfig">
            Anexar arquivo
          </q-tooltip>
        </q-btn>

        <!-- Mensagens Rápidas -->
        <q-btn
          dense
          flat
          round
          icon="mdi-message-flash-outline"
          class="action-btn"
          v-bind="buttonConfig"
          @click="$emit('toggle-quick-messages')"
        >
          <q-tooltip v-bind="tooltipConfig">
            Mensagens rápidas
          </q-tooltip>
        </q-btn>
      </template>
    </q-input>

    <!-- Slot para conteúdo adicional -->
    <slot />
  </div>
</template>

<script setup>
/**
 * Componente de campo de input para mensagens
 * @component
 * @description Campo de texto com suporte a emojis e mensagens rápidas
 */

import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { VEmojiPicker } from 'v-emoji-picker'
import { useMessageInputField } from '../../composables/chat/useMessageInputField'

/**
 * Props do componente
 */
const props = defineProps({
  /** Valor do modelo */
  modelValue: {
    type: String,
    default: ''
  },
  /** Estado de carregamento */
  loading: {
    type: Boolean,
    default: false
  },
  /** Estado desabilitado */
  disabled: {
    type: Boolean,
    default: false
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits([
  'update:modelValue',
  'send',
  'paste',
  'attach-file',
  'toggle-quick-messages'
])

/**
 * Composables
 */
const $q = useQuasar()

const {
  inputRef,
  handleEnterPress,
  insertEmoji,
  focus,
  emojiPickerConfig,
  emojiMenuConfig,
  tooltipConfig
} = useMessageInputField({ emit })

/**
 * Configuração dos botões
 */
const buttonConfig = computed(() => ({
  color: $q.dark.isActive ? 'white' : undefined,
  ripple: false
}))

// Expor métodos
defineExpose({
  focus
})
</script>

<style lang="scss" scoped>
.message-input-field {
  // Campo de input
  .input-field {
    width: 100%;
    transition: all 0.3s ease;

    // Controle do campo
    :deep(.q-field__control) {
      border-radius: 8px;
      background: var(--q-grey-2);
      transition: all 0.3s ease;
      
      &:hover {
        background: var(--q-grey-3);
      }
      
      &.q-field__control--focused {
        background: white;
        border-color: var(--q-primary);
      }
    }

    // Área de texto
    :deep(.q-field__native) {
      padding: 8px;
      font-size: 14px;
      line-height: 1.4;
      
      &::placeholder {
        color: var(--q-grey-6);
      }
    }

    // Responsividade
    @media (max-width: 850px) {
      width: 150px;
    }

    @media (min-width: 851px) and (max-width: 1360px) {
      width: 200px;
    }
  }

  // Botões de ação
  .action-btn {
    opacity: 0.7;
    transition: all 0.3s ease;
    
    &:not(:disabled) {
      &:hover {
        opacity: 1;
        transform: scale(1.1);
        background: rgba(var(--q-primary-rgb), 0.1);
      }
      
      &:active {
        transform: scale(1);
      }
    }

    &:disabled {
      opacity: 0.4;
    }

    // Ícones
    :deep(.q-icon) {
      font-size: 20px;
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .message-input-field {
    .input-field {
      :deep(.q-field__control) {
        background: rgba(255, 255, 255, 0.05);
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        &.q-field__control--focused {
          background: rgba(255, 255, 255, 0.15);
        }
      }
    }

    .action-btn {
      &:not(:disabled):hover {
        background: rgba(255, 255, 255, 0.1);
      }
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
