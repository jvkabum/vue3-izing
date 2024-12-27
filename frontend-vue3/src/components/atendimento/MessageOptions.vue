<template>
  <q-btn
    class="absolute-top-right mostar-btn-opcoes-chat"
    dense
    flat
    ripple
    round
    icon="mdi-chevron-down"
  >
    <q-menu
      square
      auto-close
      anchor="bottom left"
      self="top left"
      class="menu-options"
    >
      <q-list style="min-width: 100px">
        <q-item
          :disable="!['whatsapp', 'telegram'].includes(ticketFocado.channel)"
          clickable
          @click="$emit('citar-mensagem', mensagem)"
        >
          <q-item-section>Responder</q-item-section>
          <q-tooltip v-if="!['whatsapp', 'telegram'].includes(ticketFocado.channel)">
            Disponível apenas para WhatsApp e Telegram
          </q-tooltip>
        </q-item>
        
        <q-item clickable @click="$emit('encaminhar-mensagem', mensagem)">
          <q-item-section>Encaminhar</q-item-section>
        </q-item>
        
        <q-item clickable @click="$emit('marcar-mensagens', mensagem)">
          <q-item-section>Marcar (encaminhar várias)</q-item-section>
        </q-item>
        
        <q-item
          v-if="mensagem.fromMe && mensagem.mediaType === 'chat'"
          :disable="ticketFocado.channel === 'messenger'"
          clickable
          @click="$emit('editar-mensagem', mensagem)"
        >
          <q-item-section>
            <q-item-label>Editar Mensagem</q-item-label>
          </q-item-section>
        </q-item>
        
        <q-separator />
        
        <q-item
          v-if="mensagem.fromMe"
          :disable="ticketFocado.channel === 'messenger'"
          clickable
          @click="$emit('deletar-mensagem', mensagem)"
        >
          <q-item-section>
            <q-item-label>Deletar</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup>
defineProps({
  mensagem: {
    type: Object,
    required: true
  },
  ticketFocado: {
    type: Object,
    required: true
  }
})

defineEmits([
  'citar-mensagem',
  'encaminhar-mensagem',
  'marcar-mensagens',
  'editar-mensagem',
  'deletar-mensagem'
])
</script>

<style lang="scss" scoped>
.mostar-btn-opcoes-chat {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.message-bubble:hover .mostar-btn-opcoes-chat {
  opacity: 1;
}
</style>
