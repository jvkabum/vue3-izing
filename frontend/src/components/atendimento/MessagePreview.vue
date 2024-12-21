<template>
  <div class="message-preview">
    <!-- Mensagem de Texto -->
    <template v-if="!message.mediaUrl">
      <div class="message-body">
        {{ message.body }}
      </div>
    </template>

    <!-- Mensagem com Mídia -->
    <template v-else>
      <!-- Imagem -->
      <template v-if="isImage">
        <q-img
          :src="message.mediaUrl"
          spinner-color="white"
          style="max-width: 200px; max-height: 200px"
        >
          <template v-slot:error>
            <div class="error-placeholder">
              <q-icon name="broken_image" size="3em" color="grey-5" />
              <div class="text-caption">Erro ao carregar imagem</div>
            </div>
          </template>
        </q-img>
        <div v-if="message.body" class="message-caption">
          {{ message.body }}
        </div>
      </template>

      <!-- Áudio -->
      <template v-else-if="isAudio">
        <div class="audio-preview">
          <q-icon name="audio_file" size="2em" color="primary" />
          <div class="text-caption">Mensagem de Áudio</div>
        </div>
      </template>

      <!-- Vídeo -->
      <template v-else-if="isVideo">
        <div class="video-preview">
          <q-icon name="video_file" size="2em" color="primary" />
          <div class="text-caption">Mensagem de Vídeo</div>
        </div>
      </template>

      <!-- Documento -->
      <template v-else-if="isDocument">
        <div class="document-preview">
          <q-icon name="description" size="2em" color="primary" />
          <div class="text-caption">{{ message.mediaName }}</div>
        </div>
      </template>
    </template>

    <!-- Informações Adicionais -->
    <div class="message-info" v-if="showInfo">
      <div class="text-caption text-grey">
        {{ formatDate(message.createdAt || message.scheduleDate) }}
      </div>
      <div class="message-status" v-if="message.status">
        <q-icon
          :name="statusIcon"
          :color="statusColor"
          size="1em"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  showInfo: {
    type: Boolean,
    default: true
  }
})

// Computed
const isImage = computed(() => {
  const mediaType = props.message.mediaType?.toLowerCase()
  return mediaType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(props.message.mediaUrl)
})

const isAudio = computed(() => {
  const mediaType = props.message.mediaType?.toLowerCase()
  return mediaType?.startsWith('audio/') || /\.(mp3|wav|ogg)$/i.test(props.message.mediaUrl)
})

const isVideo = computed(() => {
  const mediaType = props.message.mediaType?.toLowerCase()
  return mediaType?.startsWith('video/') || /\.(mp4|webm|ogg)$/i.test(props.message.mediaUrl)
})

const isDocument = computed(() => {
  return !isImage.value && !isAudio.value && !isVideo.value && props.message.mediaUrl
})

const statusIcon = computed(() => {
  switch (props.message.status) {
    case 'READ':
      return 'done_all'
    case 'SENT':
      return 'done'
    case 'RECEIVED':
      return 'done_all'
    default:
      return 'schedule'
  }
})

const statusColor = computed(() => {
  switch (props.message.status) {
    case 'READ':
      return 'blue'
    case 'SENT':
    case 'RECEIVED':
      return 'grey'
    default:
      return 'orange'
  }
})

// Métodos
const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
}
</script>

<style lang="scss" scoped>
.message-preview {
  padding: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.03);
  max-width: 300px;

  .message-body {
    word-break: break-word;
    white-space: pre-wrap;
  }

  .message-caption {
    margin-top: 4px;
    font-size: 0.9em;
    color: rgba(0, 0, 0, 0.7);
  }

  .message-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 0.8em;
  }

  .audio-preview,
  .video-preview,
  .document-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;

    .text-caption {
      margin-top: 4px;
      text-align: center;
    }
  }

  .error-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.05);
  }
}

// Dark mode
:deep(.q-dark) {
  .message-preview {
    background: rgba(255, 255, 255, 0.1);

    .message-caption {
      color: rgba(255, 255, 255, 0.7);
    }

    .audio-preview,
    .video-preview,
    .document-preview,
    .error-placeholder {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>
