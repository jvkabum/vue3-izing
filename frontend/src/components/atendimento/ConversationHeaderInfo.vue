<template>
  <div class="chat-header">
    <!-- Informações do Contato -->
    <div class="contact-info" @click="openContactProfile">
      <q-avatar size="40px" class="shadow-1">
        <img 
          :src="contactInfo.profilePicUrl" 
          :alt="contactInfo.name"
          @error="handleImageError"
        />
        <q-tooltip>Ver perfil do contato</q-tooltip>
      </q-avatar>
      
      <div class="contact-details">
        <div class="contact-name">
          {{ contactInfo.name }}
          <q-icon 
            v-if="ticket.isGroup" 
            name="mdi-account-group" 
            size="18px"
            class="q-ml-xs"
          >
            <q-tooltip>Grupo</q-tooltip>
          </q-icon>
        </div>
        
        <div class="contact-number" @click.stop="copyContactNumber">
          {{ contactInfo.number }}
          <q-icon 
            name="mdi-content-copy" 
            size="16px" 
            class="q-ml-xs cursor-pointer"
          >
            <q-tooltip>Copiar número</q-tooltip>
          </q-icon>
        </div>
      </div>
    </div>

    <!-- Ações -->
    <div class="actions">
      <!-- Botão de Agendamento -->
      <q-btn
        flat
        round
        icon="mdi-clock-outline"
        :disable="!availableActions.canSchedule"
        @click="$emit('abrir:modalAgendamentoMensagem')"
      >
        <q-tooltip>Agendar Mensagem</q-tooltip>
      </q-btn>

      <!-- Menu de Ações -->
      <q-btn-dropdown flat auto-close stretch>
        <template #label>
          <q-icon name="more_vert" />
        </template>

        <q-list>
          <!-- Resolver Ticket -->
          <q-item
            v-if="availableActions.canResolve"
            clickable
            v-close-popup
            @click="$emit('updateTicket:resolver')"
          >
            <q-item-section avatar>
              <q-icon name="mdi-check-circle-outline" color="positive" />
            </q-item-section>
            <q-item-section>Resolver</q-item-section>
            <q-item-section side>
              <q-badge color="positive" text-color="white">
                {{ STATUS.CLOSED }}
              </q-badge>
            </q-item-section>
          </q-item>

          <!-- Reabrir Ticket -->
          <q-item
            v-if="availableActions.canReopen"
            clickable
            v-close-popup
            @click="$emit('updateTicket:reabrir')"
          >
            <q-item-section avatar>
              <q-icon name="mdi-refresh" color="primary" />
            </q-item-section>
            <q-item-section>Reabrir</q-item-section>
            <q-item-section side>
              <q-badge color="primary" text-color="white">
                {{ STATUS.OPEN }}
              </q-badge>
            </q-item-section>
          </q-item>

          <!-- Retornar para Fila -->
          <q-item
            v-if="availableActions.canReturn"
            clickable
            v-close-popup
            @click="$emit('updateTicket:retornar')"
          >
            <q-item-section avatar>
              <q-icon name="mdi-undo" color="warning" />
            </q-item-section>
            <q-item-section>Retornar para Fila</q-item-section>
            <q-item-section side>
              <q-badge color="warning" text-color="white">
                {{ STATUS.PENDING }}
              </q-badge>
            </q-item-section>
          </q-item>

          <q-separator />

          <!-- Informações Adicionais -->
          <q-item clickable v-close-popup @click="openContactProfile">
            <q-item-section avatar>
              <q-icon name="mdi-account-details" color="grey-7" />
            </q-item-section>
            <q-item-section>Ver Perfil</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </div>
</template>

<script setup>
/**
 * Componente de cabeçalho do chat
 * @component
 * @description Exibe informações do contato e ações do ticket
 */

import { ref } from 'vue'
import { useChatHeader } from '../../composables/chat/useChatHeader'

/**
 * Props do componente
 */
const props = defineProps({
  /** Ticket atual */
  ticket: {
    type: Object,
    required: true
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits([
  'updateTicket:resolver',
  'updateTicket:reabrir',
  'updateTicket:retornar',
  'abrir:modalAgendamentoMensagem'
])

/**
 * Composable do cabeçalho
 */
const {
  contactInfo,
  availableActions,
  STATUS,
  copyContactNumber,
  openContactProfile
} = useChatHeader(ref(props.ticket))

/**
 * Manipula erro no carregamento da imagem
 */
const handleImageError = (event) => {
  event.target.src = '/img/default-avatar.png'
}
</script>

<style lang="scss" scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  height: 64px;
  transition: all 0.3s ease;

  // Informações do contato
  .contact-info {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    transition: background-color 0.3s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .q-avatar {
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  // Detalhes do contato
  .contact-details {
    .contact-name {
      font-weight: 500;
      font-size: 1rem;
      display: flex;
      align-items: center;
    }

    .contact-number {
      font-size: 0.875rem;
      color: $grey-7;
      display: flex;
      align-items: center;
      cursor: pointer;

      &:hover {
        color: $primary;
      }
    }
  }

  // Ações
  .actions {
    display: flex;
    align-items: center;
    gap: 4px;

    .q-btn {
      opacity: 0.8;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        opacity: 1;
        transform: scale(1.05);
      }

      &:disabled {
        opacity: 0.5;
      }
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .chat-header {
    background: $dark;
    border-color: rgba(255, 255, 255, 0.12);

    .contact-info:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .contact-details {
      .contact-number {
        color: $grey-5;
      }
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .chat-header {
    height: 56px;
    padding: 8px;

    .contact-details {
      .contact-name {
        font-size: 0.9rem;
      }

      .contact-number {
        font-size: 0.8rem;
      }
    }
  }
}
</style>
