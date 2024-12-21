<template>
  <div class="bg-white no-scroll hide-scrollbar overflow-hidden" :style="style">
    <InfoCabecalhoChat
      @updateTicket:resolver="handleStatusUpdate('closed')"
      @updateTicket:retornar="handleStatusUpdate('pending')"
      @updateTicket:reabrir="handleStatusUpdate('open')"
      @abrir:modalAgendamentoMensagem="showScheduleModal = true"
    />

    <q-scroll-area
      ref="scrollContainer"
      class="scroll-y"
      :style="scrollStyle"
      @scroll="handleScroll"
    >
      <infinite-loading
        v-if="messages.length"
        @infinite="loadMoreMessages"
        direction="top"
        :identifier="ticketId"
        spinner="spiral"
      >
        <template #no-results>
          <div v-if="!messages.length">Sem mensagens</div>
        </template>
        <template #no-more>
          Não há mais mensagens
        </template>
      </infinite-loading>

      <MensagemChat
        v-if="messages.length && ticketId"
        :mensagens="messages"
        v-model:replying-message="replyingMessage"
        @mensagem:encaminhar="handleForward"
        v-model:multi-forward="multiForward"
        v-model:messages-to-forward="messagesToForward"
      />
    </q-scroll-area>

    <InputMensagem
      v-model="newMessage"
      :replying-message="replyingMessage"
      @send="handleSend"
      @cancel-reply="replyingMessage = null"
    />

    <!-- Modals -->
    <ScheduleModal
      v-model="showScheduleModal"
      :ticket-id="ticketId"
      @schedule="handleSchedule"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import { useTicketStatus } from '@/composables/useTicketStatus'
import { useSocket } from '@/composables/useSocket'

// Components
import InfoCabecalhoChat from './InfoCabecalhoChat.vue'
import MensagemChat from './MensagemChat.vue'
import InputMensagem from './InputMensagem.vue'
import ScheduleModal from './modals/ScheduleModal.vue'

// Props
const props = defineProps({
  ticketId: {
    type: String,
    required: true
  }
})

// Estado
const showScheduleModal = ref(false)
const replyingMessage = ref(null)
const newMessage = ref('')
const multiForward = ref(false)
const messagesToForward = ref([])
const scrollContainer = ref(null)

// Composables
const { messages, loading, sendMessage, loadMoreMessages } = useChat(props.ticketId)
const { updateStatus } = useTicketStatus(props.ticketId)
const { socket } = useSocket()

// Computed
const scrollStyle = computed(() => ({
  height: `calc(100vh - ${loading.value ? 135 : 62}px)`
}))

// Methods
const handleStatusUpdate = async (status) => {
  await updateStatus(status)
}

const handleSend = async () => {
  if (!newMessage.value.trim()) return
  
  await sendMessage({
    body: newMessage.value,
    replyTo: replyingMessage.value?.id
  })
  
  newMessage.value = ''
  replyingMessage.value = null
}

const handleScroll = ({ verticalPercentage }) => {
  // Lógica de scroll
}

const handleForward = (messages) => {
  messagesToForward.value = messages
  multiForward.value = true
}

const handleSchedule = async (schedule) => {
  // Lógica de agendamento
}

// Lifecycle & Watch
onMounted(() => {
  socket.on(`ticket:${props.ticketId}`, loadMoreMessages)
})

watch(() => props.ticketId, (newId) => {
  if (newId) {
    loadMoreMessages()
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.scroll-y {
  height: calc(100vh - 135px);
}
</style> 