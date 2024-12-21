<template>
  <div class="mensagens">
    <div
      v-for="message in mensagens"
      :key="message.id"
      class="mensagem"
      :class="{ 'mensagem-enviada': message.fromMe }"
    >
      <div class="mensagem-content">
        <div v-if="message.quotedMsg" class="quoted-message">
          <div class="quoted-content">
            {{ message.quotedMsg.body }}
          </div>
        </div>

        <div class="mensagem-body">
          {{ message.body }}
        </div>

        <div class="mensagem-footer">
          <span class="time">{{ formatMessageTime(message.createdAt) }}</span>
          <q-icon
            v-if="message.fromMe"
            :name="message.status === 'READ' ? 'done_all' : 'done'"
            :color="message.status === 'READ' ? 'blue' : 'grey'"
            size="16px"
          />
        </div>
      </div>

      <q-menu context-menu>
        <q-list dense>
          <q-item
            clickable
            v-close-popup
            @click="$emit('update:replyingMessage', message)"
          >
            <q-item-section>Responder</q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="$emit('delete', message)"
          >
            <q-item-section>Deletar</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const props = defineProps({
  mensagens: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:replyingMessage', 'delete'])

const formatMessageTime = (date) => {
  return format(new Date(date), 'HH:mm', { locale: ptBR })
}
</script>

<style lang="scss" scoped>
.mensagens {
  padding: 16px;
}

.mensagem {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;

  &-content {
    max-width: 80%;
    padding: 8px 12px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }

  &-enviada {
    align-items: flex-end;

    .mensagem-content {
      background: #dcf8c6;
    }
  }

  .quoted-message {
    padding: 8px;
    margin-bottom: 4px;
    border-left: 4px solid #1976d2;
    background: rgba(0,0,0,0.05);
    border-radius: 4px;
  }

  .mensagem-footer {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 0.75rem;
    color: #666;
  }
}
</style> 