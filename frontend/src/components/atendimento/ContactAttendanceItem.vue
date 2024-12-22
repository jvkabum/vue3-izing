<template>
  <q-item
    clickable
    v-ripple
    :active="isActive"
    @click="handleClick"
    :class="[
      'contato-atendimento-item',
      { 'contato-atendimento-item--disabled': disabled }
    ]"
    :active-class="activeClass"
  >
    <!-- Avatar/Icon Section -->
    <q-item-section avatar>
      <q-avatar v-if="getAvatarUrl" size="40px">
        <img 
          :src="getAvatarUrl" 
          :alt="title"
          @error="handleImageError"
        >
        <q-badge
          v-if="status"
          floating
          :color="statusColor"
          rounded
          size="12px"
        >
          <q-tooltip>{{ statusText }}</q-tooltip>
        </q-badge>
      </q-avatar>
      <q-icon 
        v-else-if="icon" 
        :name="icon" 
        :color="iconColor"
        size="40px"
      />
    </q-item-section>

    <!-- Main Content Section -->
    <q-item-section>
      <q-item-label class="row items-center">
        <span class="text-weight-medium">{{ title }}</span>
        <q-badge
          v-if="unreadCount"
          color="primary"
          class="q-ml-sm"
          rounded
        >
          {{ unreadCount }}
        </q-badge>
      </q-item-label>
      
      <q-item-label caption lines="2" class="row items-center">
        <template v-if="caption">
          <span class="text-weight-medium">{{ caption }}</span>
          <q-separator vertical inset class="q-mx-sm" v-if="lastMessage" />
        </template>
        <span v-if="lastMessage" class="ellipsis text-grey-7">
          {{ lastMessage }}
        </span>
      </q-item-label>
    </q-item-section>

    <!-- Right Side Section -->
    <q-item-section side v-if="showTimeOrActions">
      <div class="column items-end justify-between">
        <!-- Last Activity Time -->
        <div 
          v-if="lastActivity"
          class="text-caption text-grey-7"
        >
          {{ lastActivityTime }}
          <q-tooltip>
            {{ lastActivityFull }}
          </q-tooltip>
        </div>

        <!-- Action Buttons -->
        <div class="row q-gutter-x-sm items-center" v-if="$slots.actions">
          <slot name="actions" />
        </div>
      </div>
    </q-item-section>

    <!-- Loading Overlay -->
    <q-inner-loading :showing="loading" color="primary">
      <q-spinner-dots size="40px" />
    </q-inner-loading>
  </q-item>
</template>

<script setup>
/**
 * Componente de item de contato para atendimento
 * @component
 * @description Exibe informações de um contato com suporte a avatar, status, mensagens e ações
 */

import { computed, useSlots } from 'vue'
import { useContatoAtendimento } from '../../composables/atendimento/useContatoAtendimento'

const slots = useSlots()

/**
 * Props do componente
 */
const props = defineProps({
  /** Título/Nome do contato */
  title: {
    type: String,
    required: true
  },
  /** Subtítulo/Descrição */
  caption: {
    type: String,
    default: ''
  },
  /** Ícone quando não há avatar */
  icon: {
    type: String,
    default: ''
  },
  /** Cor do ícone */
  iconColor: {
    type: String,
    default: 'primary'
  },
  /** Nome da rota para ativação */
  routeName: {
    type: String,
    default: ''
  },
  /** URL do avatar */
  avatarUrl: {
    type: String,
    default: ''
  },
  /** Status do contato */
  status: {
    type: String,
    default: ''
  },
  /** Data/hora da última atividade */
  lastActivity: {
    type: String,
    default: ''
  },
  /** Última mensagem */
  lastMessage: {
    type: String,
    default: ''
  },
  /** Contador de não lidas */
  unreadCount: {
    type: Number,
    default: 0
  },
  /** Estado desabilitado */
  disabled: {
    type: Boolean,
    default: false
  },
  /** Estado de carregamento */
  loading: {
    type: Boolean,
    default: false
  },
  /** Classe CSS para estado ativo */
  activeClass: {
    type: String,
    default: 'bg-primary-1'
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits(['click', 'error'])

/**
 * Composable de contato
 */
const {
  isActive,
  statusColor,
  lastActivityTime,
  lastActivityFull,
  getAvatarUrl,
  handleClick
} = useContatoAtendimento(props, emit)

/**
 * Texto do status
 */
const statusText = computed(() => {
  const texts = {
    online: 'Online',
    offline: 'Offline',
    away: 'Ausente',
    busy: 'Ocupado'
  }
  return texts[props.status] || 'Status desconhecido'
})

/**
 * Manipula erro no carregamento da imagem
 */
const handleImageError = (event) => {
  emit('error', event)
  event.target.style.display = 'none'
}

/**
 * Verifica se deve mostrar hora ou ações
 */
const showTimeOrActions = computed(() => 
  props.lastActivity || !!slots.actions
)
</script>

<style lang="scss" scoped>
.contato-atendimento-item {
  // Estilo base
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 2px 8px;
  min-height: 72px;
  padding: 8px;

  // Hover
  &:hover {
    background: rgba(var(--q-primary-rgb), 0.05);
  }

  // Estado desabilitado
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      background: none;
    }
  }

  // Estado ativo
  &.bg-primary-1 {
    background: rgba(var(--q-primary-rgb), 0.1);
    
    &:hover {
      background: rgba(var(--q-primary-rgb), 0.15);
    }
  }

  // Avatar e badges
  :deep(.q-avatar) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    .q-badge--floating {
      right: -2px;
      bottom: -2px;
      border: 2px solid var(--q-light);
    }
  }

  // Separador vertical
  :deep(.q-separator--vertical) {
    height: 12px;
    margin-top: 2px;
  }

  // Tooltips
  :deep(.q-tooltip) {
    font-size: 12px;
    padding: 4px 8px;
  }
}

// Tema escuro
:deep(.body--dark) {
  .contato-atendimento-item {
    &:hover {
      background: rgba(255, 255, 255, 0.07);
    }

    &.bg-primary-1 {
      background: rgba(var(--q-primary-rgb), 0.2);
      
      &:hover {
        background: rgba(var(--q-primary-rgb), 0.25);
      }
    }

    .q-avatar .q-badge--floating {
      border-color: var(--q-dark);
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .contato-atendimento-item {
    margin: 1px 4px;
    min-height: 64px;
    
    :deep(.q-item__section--side) {
      padding-left: 8px;
    }

    :deep(.q-item__label) {
      font-size: 0.9em;
    }

    :deep(.q-item__label--caption) {
      font-size: 0.75em;
    }

    :deep(.q-avatar) {
      font-size: 32px;
    }
  }
}
</style>
