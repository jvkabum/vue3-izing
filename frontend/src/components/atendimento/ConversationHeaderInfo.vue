<template>
  <div class="cabecalho-chat">
    <div class="info-contato">
      <q-avatar size="40px">
        <img :src="ticket.contact?.profilePicUrl || 'default-avatar.png'" />
      </q-avatar>
      
      <div class="contato-detalhes">
        <div class="contato-nome">{{ ticket.contact?.name }}</div>
        <div class="contato-numero">{{ ticket.contact?.number }}</div>
      </div>
    </div>

    <div class="acoes">
      <q-btn-group flat>
        <q-btn
          flat
          round
          icon="schedule"
          @click="$emit('abrir:modalAgendamentoMensagem')"
        >
          <q-tooltip>Agendar Mensagem</q-tooltip>
        </q-btn>

        <q-btn-dropdown flat auto-close stretch>
          <template #label>
            <q-icon name="more_vert" />
          </template>

          <q-list>
            <q-item
              v-if="ticket.status === 'open'"
              clickable
              @click="$emit('updateTicket:resolver')"
            >
              <q-item-section>Resolver</q-item-section>
            </q-item>

            <q-item
              v-if="ticket.status === 'closed'"
              clickable
              @click="$emit('updateTicket:reabrir')"
            >
              <q-item-section>Reabrir</q-item-section>
            </q-item>

            <q-item
              v-if="ticket.status === 'open'"
              clickable
              @click="$emit('updateTicket:retornar')"
            >
              <q-item-section>Retornar para Fila</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-btn-group>
    </div>
  </div>
</template>

<script setup>
defineProps({
  ticket: {
    type: Object,
    required: true
  }
})

defineEmits([
  'updateTicket:resolver',
  'updateTicket:reabrir',
  'updateTicket:retornar',
  'abrir:modalAgendamentoMensagem'
])
</script>

<style lang="scss" scoped>
.cabecalho-chat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #ddd;
}

.info-contato {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contato-detalhes {
  .contato-nome {
    font-weight: 500;
  }
  
  .contato-numero {
    font-size: 0.9em;
    color: #666;
  }
}
</style> 