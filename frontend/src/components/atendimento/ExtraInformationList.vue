<template>
  <div class="extra-info-list">
    <!-- Lista de Informações -->
    <q-list v-if="hasInfo" class="rounded-borders">
      <q-item
        v-for="(info, idx) in infoList"
        :key="idx"
        class="info-item"
      >
        <q-item-section>
          <!-- Label -->
          <q-item-label class="text-weight-medium">
            {{ info.label || 'Informação Adicional' }}
          </q-item-label>

          <!-- Value -->
          <q-item-label caption class="text-body2 q-mt-xs">
            {{ info.value }}
          </q-item-label>

          <!-- Data -->
          <q-item-label caption v-if="info.createdAt" class="text-caption q-mt-xs">
            <q-icon 
              name="mdi-clock-outline" 
              size="14px"
              class="q-mr-xs"
            />
            {{ formatDate(info.createdAt) }}
          </q-item-label>
        </q-item-section>

        <!-- Ações -->
        <q-item-section side v-if="editable">
          <q-btn
            flat
            round
            dense
            icon="mdi-delete-outline"
            color="negative"
            @click="handleDelete(info, idx)"
          >
            <q-tooltip>Remover informação</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Estado Vazio -->
    <div v-else class="empty-state q-pa-md text-center">
      <q-icon 
        name="mdi-information-outline" 
        size="48px"
        color="grey-5"
      />
      <div class="text-grey-7 q-mt-sm">
        Nenhuma informação adicional
      </div>
    </div>

    <!-- Botão Adicionar -->
    <div v-if="editable" class="add-button q-pa-md">
      <q-btn
        flat
        color="primary"
        icon="mdi-plus"
        label="Adicionar Informação"
        class="full-width"
        @click="showAddDialog = true"
      />
    </div>

    <!-- Dialog Adicionar -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card class="add-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6">Adicionar Informação</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetForm" />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newInfo.label"
            label="Rótulo"
            dense
            outlined
            class="q-mb-md"
            placeholder="Ex: Telefone, Email, etc"
          >
            <template #prepend>
              <q-icon name="mdi-label-outline" />
            </template>
          </q-input>

          <q-input
            v-model="newInfo.value"
            label="Valor"
            dense
            outlined
            autofocus
            :rules="[val => !!val || 'Campo obrigatório']"
            placeholder="Digite o valor da informação"
          >
            <template #prepend>
              <q-icon name="mdi-text-box-outline" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
            @click="resetForm"
          />
          <q-btn
            flat
            label="Salvar"
            color="primary"
            :disable="!isFormValid"
            @click="handleAdd"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
/**
 * Componente de lista de informações extras
 * @component
 * @description Exibe e gerencia informações adicionais do contato/ticket
 */

import { computed } from 'vue'
import { useExtraInformation } from '../../composables/atendimento/useExtraInformation'

/**
 * Props do componente
 */
const props = defineProps({
  /** Lista de informações */
  infoList: {
    type: Array,
    default: () => []
  },
  /** Se permite edição */
  editable: {
    type: Boolean,
    default: false
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits(['add', 'delete'])

/**
 * Composable de informações extras
 */
const {
  showAddDialog,
  newInfo,
  isFormValid,
  formatDate,
  handleAdd,
  handleDelete,
  resetForm
} = useExtraInformation(emit)

/**
 * Se há informações para exibir
 */
const hasInfo = computed(() => 
  Array.isArray(props.infoList) && props.infoList.length > 0
)
</script>

<style lang="scss" scoped>
.extra-info-list {
  // Container
  background: white;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  // Items
  .info-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    padding: 12px 16px;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.02);

      .q-btn {
        opacity: 1;
      }
    }

    // Botões
    .q-btn {
      opacity: 0;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  // Estado vazio
  .empty-state {
    padding: 32px;
    opacity: 0.7;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.9;
    }
  }

  // Botão adicionar
  .add-button {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    background: rgba(0, 0, 0, 0.02);

    .q-btn {
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.02);
        background: rgba(var(--q-primary), 0.1);
      }
    }
  }

  // Dialog
  .add-dialog {
    min-width: 400px;
    border-radius: 8px;

    @media (max-width: 599px) {
      min-width: 300px;
    }

    .q-card__section {
      padding: 20px;
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .extra-info-list {
    background: $dark;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

    .info-item {
      border-color: rgba(255, 255, 255, 0.05);

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    .add-button {
      border-color: rgba(255, 255, 255, 0.05);
      background: rgba(255, 255, 255, 0.03);
    }

    .empty-state {
      color: $grey-5;
    }
  }
}

// Animações
.q-dialog-enter-active,
.q-dialog-leave-active {
  transition: all 0.3s ease;
}

.q-dialog-enter-from,
.q-dialog-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
