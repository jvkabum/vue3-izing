<template>
  <div class="conversation-container bg-white no-scroll hide-scrollbar overflow-hidden">
    <!-- Cabeçalho do Chat -->
    <InfoCabecalhoChat
      @updateTicket:resolver="handleStatusUpdate(STATUS.CLOSED)"
      @updateTicket:retornar="handleStatusUpdate(STATUS.PENDING)"
      @updateTicket:reabrir="handleStatusUpdate(STATUS.OPEN)"
      @abrir:modalAgendamentoMensagem="showScheduleModal = true"
    />

    <!-- Área de Mensagens -->
    <q-scroll-area
      ref="scrollContainer"
      class="scroll-area"
      :style="scrollStyle"
      @scroll="handleScroll"
    >
      <!-- Loading Infinito -->
      <infinite-loading
        v-if="messages.length"
        @infinite="loadMoreMessages"
        direction="top"
        :identifier="ticketId"
        spinner="spiral"
      >
        <template #no-results>
          <div class="text-center q-pa-md text-grey-7" v-if="!messages.length">
            Sem mensagens
          </div>
        </template>
        <template #no-more>
          <div class="text-center q-pa-md text-grey-7">
            Não há mais mensagens
          </div>
        </template>
        <template #error>
          <div class="text-center q-pa-md text-negative">
            Erro ao carregar mensagens
            <q-btn
              flat
              dense
              color="primary"
              label="Tentar novamente"
              @click="loadMoreMessages"
            />
          </div>
        </template>
      </infinite-loading>

      <!-- Lista de Mensagens -->
      <MensagemChat
        v-if="messages.length && ticketId"
        :mensagens="messages"
        v-model:replying-message="replyingMessage"
        @mensagem:encaminhar="handleForward"
        v-model:multi-forward="multiForward"
        v-model:messages-to-forward="messagesToForward"
      />

      <!-- Estado Vazio -->
      <div 
        v-else-if="!loading" 
        class="column items-center justify-center full-height q-pa-lg"
      >
        <q-icon name="mdi-chat-outline" size="48px" color="grey-5" />
        <div class="text-grey-7 q-mt-sm">
          Inicie uma conversa
        </div>
      </div>
    </q-scroll-area>

    <!-- Input de Mensagem -->
    <InputMensagem
      v-model="newMessage"
      :replying-message="replyingMessage"
      :disabled="updating"
      @send="handleSend"
      @cancel-reply="replyingMessage = null"
      @typing="handleTyping"
    />

    <!-- Modais -->
    <ScheduleModal
      v-model="showScheduleModal"
      :ticket-id="ticketId"
      @schedule="handleSchedule"
    />

    <!-- Loading Overlay -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="40px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup>
/**
 * Componente de conversação
 * @component
 * @description Exibe e gerencia uma conversa de atendimento
 */

import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useChat } from '../../composables/chat/useChat'
import { useTicketStatus } from '../../composables/chat/useTicketStatus'
import { useSocketChat } from '../../composables/chat/useSocketChat'

// Components
import InfoCabecalhoChat from './InfoCabecalhoChat.vue'
import MensagemChat from './MensagemChat.vue'
import InputMensagem from './InputMensagem.vue'
import ScheduleModal from './modals/ScheduleModal.vue'

/**
 * Props do componente
 */
const props = defineProps({
  /** ID do ticket */
  ticketId: {
    type: String,
    required: true
  }
})

// Composables
const $q = useQuasar()
const { 
  messages, 
  loading, 
  sendMessage, 
  loadMoreMessages 
} = useChat(props.ticketId)

const { 
  updating, 
  STATUS, 
  updateStatus 
} = useTicketStatus(props.ticketId)

const {
  isConnected,
  sendTyping
} = useSocketChat(props.ticketId)

// Estado local
const showScheduleModal = ref(false)
const replyingMessage = ref(null)
const newMessage = ref('')
const multiForward = ref(false)
const messagesToForward = ref([])
const scrollContainer = ref(null)
const typingTimeout = ref(null)

/**
 * Estilo da área de scroll
 */
const scrollStyle = computed(() => ({
  height: `calc(100vh - ${loading.value ? 135 : 62}px)`
}))

/**
 * Manipuladores de eventos
 */
const handleStatusUpdate = async (status) => {
  try {
    await updateStatus(status)
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
  }
}

const handleSend = async () => {
  const message = newMessage.value.trim()
  if (!message) return
  
  try {
    await sendMessage({
      body: message,
      replyTo: replyingMessage.value?.id
    })
    
    newMessage.value = ''
    replyingMessage.value = null
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
  }
}

const handleScroll = ({ verticalPercentage }) => {
  // Implementar lógica de scroll
}

const handleForward = (messages) => {
  messagesToForward.value = messages
  multiForward.value = true
}

const handleSchedule = async (schedule) => {
  // Implementar lógica de agendamento
}

const handleTyping = () => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  sendTyping(true)
  
  typingTimeout.value = setTimeout(() => {
    sendTyping(false)
  }, 2000)
}

// Watchers
watch(() => props.ticketId, (newId) => {
  if (newId) {
    loadMoreMessages()
  }
}, { immediate: true })

// Limpa timeout ao desmontar
onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})
</script>

<style lang="scss" scoped>
.conversation-container {
  height: 100vh;
  display: flex;
  flex-direction: column;

  // Área de scroll
  .scroll-area {
    flex: 1;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.02),
      rgba(0, 0, 0, 0.01)
    );

    :deep(.q-scrollarea__thumb) {
      width: 4px;
      opacity: 0.2;
      transition: opacity 0.3s;

      &:hover {
        opacity: 0.4;
      }
    }
  }

  // Estado vazio
  .full-height {
    height: 100%;
    min-height: 300px;
  }

  // Tema escuro
  :deep(.body--dark) & {
    background: $dark;

    .scroll-area {
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.03),
        rgba(255, 255, 255, 0.01)
      );
    }
  }
}
</style>
