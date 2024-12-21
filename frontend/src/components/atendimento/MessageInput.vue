<template>
  <div>
    <!-- Área de Input para Tickets Ativos -->
    <template v-if="ticketStatus !== 'pending'">
      <!-- Menu de Mensagens Rápidas -->
      <quick-messages-menu
        ref="menuFast"
        :messages="quickMessages"
        :show="showQuickMessages"
        :text="messageText"
        @select="handleQuickMessageSelect"
        @hide="showQuickMessages = false"
      />

      <!-- Área Principal de Input -->
      <div class="row q-pb-md q-pt-sm bg-white justify-start items-center text-grey-9 relative-position"
           style="min-height: 80px">
        
        <!-- Seletor de Data para Agendamento -->
        <schedule-date-picker
          v-if="isScheduleMode"
          v-model="scheduleDate"
        />

        <!-- Controles de Mensagem -->
        <template v-if="!isRecordingAudio">
          <!-- Botões de Ação (Desktop) -->
          <message-action-buttons
            v-if="$q.screen.width > 500"
            :disabled="isActionsDisabled"
            :sign="sign"
            @toggle-sign="handleSign"
            @attach-file="openFileAttachment"
            @emoji-select="insertEmoji"
            @video-link="sendVideoLink"
          />

          <!-- Campo de Mensagem -->
          <message-input-field
            v-show="!showFileUpload"
            ref="inputMessage"
            v-model="messageText"
            :loading="loading"
            :disabled="isActionsDisabled"
            :show-quick-messages="showQuickMessages"
            @send="sendMessage"
            @paste="handlePaste"
            @toggle-quick-messages="showQuickMessages = !showQuickMessages"
          />

          <!-- Upload de Arquivos -->
          <file-upload-field
            v-show="showFileUpload"
            v-model="files"
            :loading="loading"
            :disabled="isActionsDisabled"
            @rejected="handleRejectedFiles"
          />

          <!-- Botões de Envio -->
          <send-buttons
            :show-send="messageText || showFileUpload"
            :show-audio="!messageText && !showFileUpload && !isRecordingAudio"
            :disabled="ticketStatus !== 'open'"
            :actions-disabled="isActionsDisabled"
            @send="sendMessage"
            @start-recording="startAudioRecording"
          />
        </template>

        <!-- Gravação de Áudio -->
        <audio-recording-controls
          v-else
          :is-recording="isRecordingAudio"
          @cancel="cancelAudioRecording"
          @stop="stopAudioRecording"
        />

        <!-- Modal de Preview de Imagem -->
        <media-preview-modal
          v-model="showMediaPreview"
          :media="mediaPreview"
          @hide="hideMediaPreview"
          @send="sendMessage"
        />
      </div>
    </template>

    <!-- Botão de Iniciar Atendimento -->
    <template v-else>
      <div class="row q-pb-md q-pt-sm bg-white justify-center items-center text-grey-9 relative-position"
           style="min-height: 80px">
        <q-btn
          push
          rounded
          style="width: 250px"
          class="text-bold"
          color="positive"
          icon="mdi-send-circle"
          label="Iniciar o atendimento"
          @click="startTicket"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar, uid, LocalStorage } from 'quasar'
import { useChat } from '../../../composables/useChat'
import { useTickets } from '../../../composables/useTickets'
import { useAudioRecorder } from '../../../composables/useAudioRecorder'
import QuickMessagesMenu from './QuickMessagesMenu.vue'
import MessageActionButtons from './MessageActionButtons.vue'
import MessageInputField from './MessageInputField.vue'
import FileUploadField from './FileUploadField.vue'
import SendButtons from './SendButtons.vue'
import AudioRecordingControls from './AudioRecordingControls.vue'
import MediaPreviewModal from './MediaPreviewModal.vue'
import ScheduleDatePicker from './ScheduleDatePicker.vue'

// Props
const props = defineProps({
  replyingMessage: {
    type: Object,
    default: null
  },
  isScheduleMode: {
    type: Boolean,
    default: false
  },
  quickMessages: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:replyingMessage'])

// Composables
const $q = useQuasar()
const { sendMessage: sendChatMessage, scrollToBottom } = useChat()
const { ticketStatus, startTicket } = useTickets()
const { startRecording, stopRecording, isRecording } = useAudioRecorder()

// Estado
const loading = ref(false)
const messageText = ref('')
const files = ref([])
const sign = ref(LocalStorage.getItem('sign') ?? false)
const scheduleDate = ref(null)
const showQuickMessages = ref(false)
const showMediaPreview = ref(false)
const mediaPreview = ref({ title: '', src: '' })
const isRecordingAudio = ref(false)

// Computed
const showFileUpload = computed(() => files.value.length > 0)
const isActionsDisabled = computed(() => 
  isRecordingAudio.value || ticketStatus.value !== 'open'
)

// Métodos
const handleQuickMessageSelect = (message) => {
  messageText.value = message.message
  setTimeout(() => {
    inputMessage.value?.focus()
  }, 300)
}

const handleSign = (state) => {
  sign.value = state
  LocalStorage.set('sign', state)
}

const handlePaste = async (event) => {
  const file = event.clipboardData.files[0]
  if (file) {
    messageText.value = ''
    files.value = [file]
    showMediaPreview.value = true
    mediaPreview.value = {
      title: `Enviar imagem`,
      src: URL.createObjectURL(file)
    }
  }
}

const sendMessage = async () => {
  if (props.isScheduleMode && !scheduleDate.value) {
    $q.notify({
      type: 'warning',
      message: 'Para agendar uma mensagem, informe a data/hora.',
      position: 'top'
    })
    return
  }

  try {
    loading.value = true
    
    const message = prepareMessage()
    await sendChatMessage(message)
    
    resetForm()
    scrollToBottom()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar mensagem',
      position: 'top'
    })
    console.error('Erro ao enviar mensagem:', error)
  } finally {
    loading.value = false
  }
}

const prepareMessage = () => {
  if (showFileUpload.value) {
    return prepareFileMessage()
  }
  return prepareTextMessage()
}

const prepareTextMessage = () => {
  let text = messageText.value.trim()
  if (!text) throw new Error('Mensagem vazia')

  if (sign.value) {
    const username = LocalStorage.getItem('username')
    text = `*${username}*:\n ${text}`
  }

  return {
    id: uid(),
    body: text,
    fromMe: true,
    scheduleDate: scheduleDate.value,
    quotedMsg: props.replyingMessage
  }
}

const prepareFileMessage = () => {
  const formData = new FormData()
  files.value.forEach(file => {
    formData.append('medias', file)
    formData.append('body', file.name)
  })
  
  if (scheduleDate.value) {
    formData.append('scheduleDate', scheduleDate.value)
  }
  
  return formData
}

const resetForm = () => {
  messageText.value = ''
  files.value = []
  showMediaPreview.value = false
  mediaPreview.value = { title: '', src: '' }
  emit('update:replyingMessage', null)
}

// Lifecycle
onMounted(() => {
  window.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
})
</script>

<style lang="scss" scoped>
.input-message {
  @media (max-width: 850px) {
    width: 150px;
  }

  @media (min-width: 851px) and (max-width: 1360px) {
    width: 200px !important;
  }
}
</style>
