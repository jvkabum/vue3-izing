<template>
  <div class="message-input">
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
      <div 
        class="input-container row q-pb-md q-pt-sm bg-white justify-start items-center text-grey-9"
      >
        <!-- Seletor de Data para Agendamento -->
        <schedule-date-picker
          v-if="isScheduleMode"
          v-model="scheduleDate"
          class="q-mb-sm"
        />

        <!-- Controles de Mensagem -->
        <template v-if="!isRecordingAudio">
          <!-- Botões de Ação (Desktop) -->
          <message-action-buttons
            v-if="$q.screen.gt.xs"
            :disabled="isActionsDisabled"
            :sign="sign"
            @toggle-sign="handleSign"
            @attach-file="$refs.fileUpload?.pickFiles()"
            @emoji-select="insertEmoji"
            @video-link="sendVideoLink"
          />

          <!-- Campo de Mensagem -->
          <div 
            class="message-field col"
            :class="{ 'q-px-md': $q.screen.gt.xs }"
          >
            <!-- Mensagem Sendo Respondida -->
            <div 
              v-if="replyingMessage"
              class="replying-message q-px-md q-py-sm bg-blue-1"
            >
              <div class="row items-center justify-between">
                <div class="text-subtitle2 text-primary">
                  Respondendo mensagem
                </div>
                <q-btn
                  flat
                  round
                  dense
                  icon="close"
                  @click="$emit('update:replyingMessage', null)"
                >
                  <q-tooltip>Cancelar resposta</q-tooltip>
                </q-btn>
              </div>
              <div class="text-caption q-mt-xs">
                {{ replyingMessage.body }}
              </div>
            </div>

            <!-- Campo de Input -->
            <message-input-field
              v-show="!showFileUpload"
              ref="inputRef"
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
              ref="fileUpload"
              v-model="files"
              :loading="loading"
              :disabled="isActionsDisabled"
              @rejected="handleRejectedFiles"
            />
          </div>

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
      </div>

      <!-- Modal de Preview de Mídia -->
      <media-preview-modal
        v-model="showMediaPreview"
        :media="mediaPreview"
        :loading="loading"
        @hide="hideMediaPreview"
        @send="sendMessage"
      />
    </template>

    <!-- Botão de Iniciar Atendimento -->
    <template v-else>
      <div class="start-ticket row q-pb-md q-pt-sm bg-white justify-center items-center">
        <q-btn
          push
          rounded
          color="positive"
          icon="mdi-headset"
          label="Iniciar Atendimento"
          class="start-button"
          @click="startTicket"
        >
          <q-tooltip>Clique para iniciar o atendimento</q-tooltip>
        </q-btn>
      </div>
    </template>
  </div>
</template>

<script setup>
/**
 * Componente de input de mensagens
 * @component
 * @description Permite envio de mensagens, arquivos e áudios
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useMessageInput } from '../../composables/chat/useMessageInput'
import { useAudioRecorder } from '../../composables/audio/useAudioRecording'
import { useTicketStatus } from '../../composables/chat/useTicketStatus'

// Componentes
import QuickMessagesMenu from './QuickMessagesMenu.vue'
import MessageActionButtons from './MessageActionButtons.vue'
import MessageInputField from './MessageInputField.vue'
import FileUploadField from './FileUploadField.vue'
import SendButtons from './SendButtons.vue'
import AudioRecordingControls from './AudioRecordingControls.vue'
import MediaPreviewModal from './MediaPreviewModal.vue'
import ScheduleDatePicker from './ScheduleDatePicker.vue'

/**
 * Props do componente
 */
const props = defineProps({
  /** Mensagem sendo respondida */
  replyingMessage: {
    type: Object,
    default: null
  },
  /** Modo de agendamento */
  isScheduleMode: {
    type: Boolean,
    default: false
  },
  /** Lista de mensagens rápidas */
  quickMessages: {
    type: Array,
    default: () => []
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits(['update:replyingMessage'])

/**
 * Refs para componentes filhos
 */
const menuFast = ref(null)
const fileUpload = ref(null)

/**
 * Composables
 */
const { startTicket } = useTicketStatus()
const { startRecording, stopRecording } = useAudioRecorder()

const {
  loading,
  messageText,
  files,
  sign,
  scheduleDate,
  showQuickMessages,
  showMediaPreview,
  mediaPreview,
  isRecordingAudio,
  inputRef,
  showFileUpload,
  isActionsDisabled,
  handleQuickMessageSelect,
  handleSign,
  handlePaste,
  sendMessage,
  resetForm,
  handleRejectedFiles
} = useMessageInput({ 
  emit,
  replyingMessage: props.replyingMessage 
})

/**
 * Manipuladores de áudio
 */
const startAudioRecording = async () => {
  try {
    await startRecording()
    isRecordingAudio.value = true
  } catch (error) {
    console.error('Erro ao iniciar gravação:', error)
  }
}

const stopAudioRecording = async () => {
  try {
    const audioBlob = await stopRecording()
    files.value = [
      new File([audioBlob], 'audio.mp3', { type: 'audio/mp3' })
    ]
    isRecordingAudio.value = false
    sendMessage()
  } catch (error) {
    console.error('Erro ao parar gravação:', error)
  }
}

const cancelAudioRecording = () => {
  stopRecording()
  isRecordingAudio.value = false
}

/**
 * Manipuladores de emoji e vídeo
 */
const insertEmoji = (emoji) => {
  messageText.value += emoji.data
  inputRef.value?.focus()
}

const sendVideoLink = (link) => {
  messageText.value = link
  sendMessage()
}

/**
 * Manipulador de preview
 */
const hideMediaPreview = () => {
  showMediaPreview.value = false
  files.value = []
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
.message-input {
  // Container principal
  .input-container {
    min-height: 80px;
    padding: 8px 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease;
  }

  // Campo de mensagem
  .message-field {
    transition: all 0.3s ease;

    // Mensagem sendo respondida
    .replying-message {
      border-radius: 8px;
      margin-bottom: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(var(--q-primary-rgb), 0.1);
      }

      .q-btn {
        opacity: 0.7;
        transition: all 0.3s ease;

        &:hover {
          opacity: 1;
          transform: scale(1.1);
        }
      }
    }
  }

  // Botão de iniciar atendimento
  .start-ticket {
    min-height: 80px;
    
    .start-button {
      width: 250px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .message-input {
    .input-container {
      border-color: rgba(255, 255, 255, 0.12);
    }

    .replying-message {
      background: rgba(255, 255, 255, 0.05);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .start-button {
      &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .message-input {
    .input-container {
      padding: 8px;
    }

    .start-button {
      width: 200px;
    }
  }
}

// Animações
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
