<template>
  <q-banner 
    class="forward-banner text-grey-8"
    rounded
  >
    <!-- Contador de Mensagens -->
    <div class="message-counter">
      <span class="text-bold text-h5">
        {{ getCountText(messages.length) }}
      </span>
      selecionadas para serem encaminhadas.
    </div>
    
    <q-separator class="q-my-md bg-grey-4" />
    
    <!-- Seleção de Contato -->
    <q-select
      ref="selectRef"
      v-model="selectedContactModel"
      class="contact-select q-mb-md"
      dense
      autofocus
      outlined
      rounded
      hide-dropdown-icon
      :loading="loading"
      :options="contacts"
      input-debounce="700"
      @filter="onFilter"
      use-input
      hide-selected
      fill-input
      clearable
      option-label="name"
      option-value="id"
      label="Localize e selecione o contato"
    >
      <!-- Hint -->
      <template #hint>
        <div class="row items-center text-grey-7">
          <q-icon name="mdi-information-outline" size="16px" class="q-mr-xs" />
          Digite no mínimo duas letras para localizar o contato
        </div>
      </template>

      <!-- Template de Opção -->
      <template #option="{ opt, itemProps, itemEvents }">
        <q-item
          v-bind="itemProps"
          v-on="itemEvents"
          v-if="opt.name"
        >
          <q-item-section avatar>
            <q-avatar>
              <img 
                :src="opt.profilePicUrl" 
                @error="handleAvatarError"
                :alt="opt.name"
              >
              <q-icon 
                name="mdi-account" 
                v-if="!opt.profilePicUrl"
                color="grey-7" 
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ opt.name }}</q-item-label>
            <q-item-label caption>
              <q-icon 
                name="mdi-phone" 
                size="14px" 
                class="q-mr-xs"
                color="grey-7"
              />
              {{ opt.number }}
            </q-item-label>
          </q-item-section>

          <q-item-section side v-if="opt.isGroup">
            <q-icon 
              name="mdi-account-group" 
              color="primary"
              size="20px"
            >
              <q-tooltip>Grupo</q-tooltip>
            </q-icon>
          </q-item-section>
        </q-item>
      </template>

      <!-- Nenhum Resultado -->
      <template #no-option>
        <q-item>
          <q-item-section class="text-grey text-center">
            <q-icon name="mdi-account-search" size="24px" />
            <div class="q-mt-sm">Nenhum contato encontrado</div>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- Ações -->
    <template #action>
      <div class="row q-gutter-sm">
        <q-btn
          flat
          color="negative"
          label="Cancelar"
          icon="mdi-close"
          @click="$emit('cancel')"
          :disable="loading"
          class="action-btn"
        >
          <q-tooltip>Cancelar encaminhamento</q-tooltip>
        </q-btn>

        <q-btn
          flat
          color="positive"
          label="Enviar"
          icon="mdi-send"
          :loading="loading"
          :disable="!selectedContactModel"
          @click="handleSend"
          class="action-btn"
        >
          <q-tooltip>
            Encaminhar {{ messages.length }} 
            {{ messages.length === 1 ? 'mensagem' : 'mensagens' }}
          </q-tooltip>

          <template #loading>
            <q-spinner-dots color="white" />
          </template>
        </q-btn>
      </div>
    </template>
  </q-banner>
</template>

<script setup>
/**
 * Componente de banner para encaminhamento de mensagens
 * @component
 * @description Permite selecionar contato e encaminhar mensagens
 */

import { computed } from 'vue'
import { useMessageForward } from '../../composables/chat/useMessageForward'

/**
 * Props do componente
 */
const props = defineProps({
  /** Mensagens selecionadas */
  messages: {
    type: Array,
    required: true,
    validator: (value) => value.length <= 10
  },
  /** Contato selecionado */
  selectedContact: {
    type: Object,
    default: () => ({})
  },
  /** Estado de carregamento */
  loading: {
    type: Boolean,
    default: false
  },
  /** Lista de contatos */
  contacts: {
    type: Array,
    required: true
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits({
  'update:selectedContact': (contact) => contact?.id !== undefined,
  'search': null,
  'cancel': null,
  'send': null
})

/**
 * Composable de encaminhamento
 */
const {
  selectRef,
  getCountText,
  validateContact,
  filterContacts
} = useMessageForward()

/**
 * Model para contato selecionado
 */
const selectedContactModel = computed({
  get: () => props.selectedContact,
  set: (value) => emit('update:selectedContact', value)
})

/**
 * Manipuladores de eventos
 */
const handleSend = () => {
  if (!validateContact(selectedContactModel.value)) return
  emit('send')
}

const onFilter = (val, update, abort) => {
  emit('search', val, update, abort)
}

const handleAvatarError = (event) => {
  event.target.style.display = 'none'
}
</script>

<style lang="scss" scoped>
.forward-banner {
  // Container
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  // Contador
  .message-counter {
    font-size: 1.1em;
    color: var(--q-primary);
  }

  // Select de contato
  .contact-select {
    :deep(.q-field__control) {
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--q-primary);
      }

      &--focused {
        border-color: var(--q-primary);
        box-shadow: 0 0 0 1px var(--q-primary);
      }
    }
  }

  // Botões de ação
  .action-btn {
    border-radius: 8px;
    padding: 8px 16px;
    transition: all 0.3s ease;

    &:not(:disabled) {
      &:hover {
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }

    &.text-negative {
      &:hover {
        background: rgba(var(--q-negative-rgb), 0.1);
      }
    }

    &.text-positive {
      &:hover {
        background: rgba(var(--q-positive-rgb), 0.1);
      }
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .forward-banner {
    background: $dark;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    .message-counter {
      color: var(--q-primary);
    }

    .contact-select {
      .q-field__control {
        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      }
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .forward-banner {
    margin: 4px;

    .message-counter {
      font-size: 1em;
    }

    .action-btn {
      padding: 6px 12px;
    }
  }
}
</style>
