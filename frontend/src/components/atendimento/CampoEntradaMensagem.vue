<template>
  <q-input
    ref="inputRef"
    hide-bottom-space
    :loading="loading"
    :disable="disabled"
    type="textarea"
    class="col-grow q-mx-xs text-grey-10 message-input"
    bg-color="grey-2"
    color="grey-7"
    placeholder="Digite sua mensagem"
    input-style="max-height: 30vh"
    autogrow
    rounded
    dense
    outlined
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @keydown.enter.exact.prevent="handleEnterPress"
    @paste="$emit('paste', $event)"
  >
    <!-- Botões Mobile -->
    <template #prepend v-if="$q.screen.width < 500">
      <q-btn
        flat
        icon="mdi-emoticon-happy-outline"
        :disable="disabled"
        dense
        round
        :color="$q.dark.isActive ? 'white' : ''"
      >
        <q-tooltip content-class="text-bold">
          Emoji
        </q-tooltip>
        <q-menu
          anchor="top right"
          self="bottom middle"
          :offset="[5, 40]"
        >
          <v-emoji-picker
            style="width: 40vw"
            :showSearch="false"
            :emojisByRow="20"
            labelSearch="Localizar..."
            lang="pt-BR"
            @select="handleEmojiSelect"
          />
        </q-menu>
      </q-btn>
    </template>

    <!-- Botões Append -->
    <template #append>
      <!-- Anexar Arquivo (Mobile) -->
      <q-btn
        v-if="$q.screen.width < 500"
        flat
        icon="mdi-paperclip"
        :disable="disabled"
        dense
        round
        class="bg-padrao btn-rounded"
        :color="$q.dark.isActive ? 'white' : ''"
        @click="$emit('attach-file')"
      >
        <q-tooltip content-class="text-bold">
          Enviar arquivo
        </q-tooltip>
      </q-btn>

      <!-- Mensagens Rápidas -->
      <q-btn
        dense
        flat
        round
        icon="mdi-message-flash-outline"
        @click="$emit('toggle-quick-messages')"
      >
        <q-tooltip content-class="text-bold">
          Mensagens Rápidas
        </q-tooltip>
      </q-btn>
    </template>
  </q-input>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { VEmojiPicker } from 'v-emoji-picker'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'send',
  'paste',
  'attach-file',
  'toggle-quick-messages'
])

// Composables
const $q = useQuasar()

// Refs
const inputRef = ref(null)

// Métodos
const handleEnterPress = () => {
  if (props.modelValue.trim()) {
    emit('send')
  }
}

const handleEmojiSelect = (emoji) => {
  if (!emoji.data) return

  const input = inputRef.value.$refs.input
  const startPos = input.selectionStart
  const endPos = input.selectionEnd
  
  const text = props.modelValue
  const newText = text.substring(0, startPos) + emoji.data + text.substring(endPos)
  
  emit('update:modelValue', newText)
  
  // Posicionar cursor após o emoji
  setTimeout(() => {
    input.selectionStart = input.selectionEnd = startPos + emoji.data.length
  }, 10)
}

const focus = () => {
  inputRef.value?.focus()
}

// Expor métodos
defineExpose({
  focus
})

// Event Listeners
onMounted(() => {
  window.$root?.$on('mensagem-chat:focar-input-mensagem', focus)
})

onUnmounted(() => {
  window.$root?.$off('mensagem-chat:focar-input-mensagem', focus)
})
</script>

<style lang="scss" scoped>
.message-input {
  @media (max-width: 850px) {
    width: 150px;
  }

  @media (min-width: 851px) and (max-width: 1360px) {
    width: 200px !important;
  }

  :deep(.q-field__control) {
    border-radius: 8px;
    background: var(--q-grey-2);
    
    &:hover {
      background: var(--q-grey-3);
    }
    
    &.q-field__control--focused {
      background: white;
    }
  }

  :deep(.q-field__native) {
    padding: 8px;
    font-size: 14px;
    line-height: 1.4;
    
    &::placeholder {
      color: var(--q-grey-6);
    }
  }
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
  }
}

.btn-rounded {
  border-radius: 50%;
}

:deep(.q-tooltip) {
  font-size: 14px;
  padding: 8px 12px;
  background: var(--q-primary);
}
</style>
