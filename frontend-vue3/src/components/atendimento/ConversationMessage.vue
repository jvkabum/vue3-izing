<template>
  <div class="q-pa-md conversation-container">
    <!-- Lista de mensagens -->
    <div v-for="mensagem in mensagens" :key="mensagem.id" class="q-mb-md">
      <div :class="['message-container', mensagem.fromMe ? 'sent' : 'received']">
        <!-- Mensagem usando componente q-chat-message do Quasar -->
        <q-chat-message
          :name="mensagem.fromMe ? 'Você' : mensagem.contact?.name"
          :text="[mensagem.body]"
          :sent="mensagem.fromMe"
          :stamp="formatMessageDate(mensagem.createdAt)"
          :bg-color="mensagem.fromMe ? 'primary' : 'grey-3'"
          :text-color="mensagem.fromMe ? 'white' : 'black'"
        >
          <!-- Slot para ícone de mídia quando houver anexo -->
          <template v-if="mensagem.mediaUrl" #avatar>
            <q-btn
              flat
              round
              size="sm"
              :icon="getMediaIcon(mensagem.mediaType)"
              @click="handleMediaClick(mensagem)"
            />
          </template>
        </q-chat-message>
      </div>
    </div>

    <!-- Modal de preview de mídia -->
    <q-dialog v-model="isMediaPreviewVisible">
      <q-card class="media-preview-card">
        <q-card-section class="row items-center justify-end">
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="media-content">
          <!-- Preview de imagem -->
          <img
            v-if="isImage(currentMediaType)"
            :src="currentMediaUrl"
            class="media-preview"
            alt="Media preview"
          />
          <!-- Preview de vídeo -->
          <video
            v-else-if="isVideo(currentMediaType)"
            :src="currentMediaUrl"
            controls
            class="media-preview"
          />
          <!-- Player de áudio -->
          <audio
            v-else-if="isAudio(currentMediaType)"
            :src="currentMediaUrl"
            controls
            class="audio-preview"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { useMessageFormat } from '../../composables/atendimento/useMessageFormat'
import { useMediaHandler } from '../../composables/atendimento/useMediaHandler'

// Props
const props = defineProps({
  /**
   * Array de mensagens a serem exibidas
   * @type {Array}
   */
  mensagens: {
    type: Array,
    default: () => []
  }
})

// Composables
const { formatMessageDate, getMediaIcon } = useMessageFormat()
const {
  isMediaPreviewVisible,
  currentMediaUrl,
  currentMediaType,
  handleMediaClick,
  isImage,
  isVideo,
  isAudio
} = useMediaHandler()
</script>

<style lang="sass" scoped>
// Container principal das mensagens
.conversation-container
  height: 100%
  overflow-y: auto
  background-color: rgba(255, 255, 255, 0.9)

// Container individual de cada mensagem
.message-container
  max-width: 80%
  margin: 8px 0
  transition: all 0.3s ease

  // Mensagens enviadas (alinhadas à direita)
  &.sent
    margin-left: auto
    .q-message-text
      background: $primary
      color: white

  // Mensagens recebidas (alinhadas à esquerda)
  &.received
    margin-right: auto
    .q-message-text
      background: $grey-3
      color: black

// Estilização do balão de mensagem
.q-message-text
  border-radius: 8px
  padding: 8px 12px
  box-shadow: 0 1px 2px rgba(0,0,0,0.1)

// Card de preview de mídia
.media-preview-card
  max-width: 90vw
  max-height: 90vh

// Conteúdo de mídia
.media-content
  display: flex
  justify-content: center
  align-items: center
  padding: 0

// Preview de mídia (imagem/vídeo)
.media-preview
  max-width: 100%
  max-height: 70vh
  object-fit: contain

// Player de áudio
.audio-preview
  width: 100%
  margin: 10px 0
</style>
