<template>
  <q-list v-if="messages.length">
    <q-item v-for="(message, idx) in messages" :key="idx" clickable>
      <q-item-section>
        <!-- Data Agendamento -->
        <q-item-label caption>
          <b>Agendado para:</b> {{ formatDate(message.scheduleDate) }}
          <q-btn
            flat
            round
            dense
            icon="mdi-trash-can-outline"
            class="absolute-top-right q-mr-sm"
            size="sm"
            @click.stop="handleDelete(message)"
          >
            <q-tooltip>
              Excluir mensagem agendada
            </q-tooltip>
          </q-btn>
        </q-item-label>

        <!-- Conteúdo da Mensagem -->
        <q-item-label caption lines="2">
          <b>Msg:</b> {{ message.mediaName || message.body }}
        </q-item-label>
      </q-item-section>

      <!-- Preview da Mensagem -->
      <q-tooltip :delay="500">
        <MessagePreview :message="message" />
      </q-tooltip>
    </q-item>
  </q-list>

  <!-- Estado Vazio -->
  <q-item v-else>
    <q-item-section>
      <q-item-label caption class="text-center">
        Nenhuma mensagem agendada
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import MessagePreview from './MessagePreview.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete'])

// Métodos
const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

const handleDelete = (message) => {
  emit('delete', message)
}
</script>

<style lang="scss" scoped>
.q-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  &:last-child {
    border-bottom: none;
  }
}

.q-item-label {
  &.caption {
    line-height: 1.4;
  }
}

.q-btn {
  opacity: 0;
  transition: opacity 0.3s;
}

.q-item:hover {
  .q-btn {
    opacity: 1;
  }
}
</style>
