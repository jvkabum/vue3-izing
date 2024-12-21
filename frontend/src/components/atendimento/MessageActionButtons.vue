<template>
  <div class="row items-center q-gutter-x-xs">
    <!-- Anexar Arquivo -->
    <q-btn
      flat
      dense
      icon="mdi-paperclip"
      :disable="disabled"
      class="bg-padrao btn-rounded"
      :color="$q.dark.isActive ? 'white' : ''"
      @click="$emit('attach-file')"
    >
      <q-tooltip content-class="text-bold">
        Enviar arquivo
      </q-tooltip>
    </q-btn>

    <!-- Emoji -->
    <q-btn
      flat
      dense
      icon="mdi-emoticon-happy-outline"
      :disable="disabled"
      class="bg-padrao btn-rounded"
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
          @select="$emit('emoji-select', $event)"
        />
      </q-menu>
    </q-btn>

    <!-- Link de Vídeo -->
    <q-btn
      flat
      dense
      icon="mdi-message-video"
      :disable="disabled"
      class="bg-padrao btn-rounded"
      :color="$q.dark.isActive ? 'white' : ''"
      @click="$emit('video-link')"
    >
      <q-tooltip content-class="text-bold">
        Enviar link para videoconferência
      </q-tooltip>
    </q-btn>

    <!-- Assinatura -->
    <q-toggle
      keep-color
      v-model="signModel"
      dense
      class="q-mx-sm q-ml-md"
      :color="signModel ? 'positive' : 'black'"
      type="toggle"
    >
      <q-tooltip>
        {{ signModel ? 'Desativar' : 'Ativar' }} Assinatura
      </q-tooltip>
    </q-toggle>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { VEmojiPicker } from 'v-emoji-picker'

// Props
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  sign: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'attach-file',
  'emoji-select',
  'video-link',
  'toggle-sign'
])

// Composables
const $q = useQuasar()

// Computed
const signModel = computed({
  get: () => props.sign,
  set: (value) => emit('toggle-sign', value)
})
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

.q-toggle {
  :deep(.q-toggle__inner) {
    &:before {
      border-radius: 12px;
    }
    
    .q-toggle__thumb {
      border-radius: 50%;
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
}

:deep(.v-emoji-picker) {
  --vep-color-border: var(--q-separator-color);
  --vep-color-background: var(--q-card-color);
  --vep-color-text: var(--q-primary-text-color);
  
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.q-tooltip {
  font-size: 14px;
  padding: 8px 12px;
  background: var(--q-primary);
}
</style>
