<template>
  <q-dialog
    v-model="dialogModel"
    position="right"
    @hide="handleHide"
    @show="handleShow"
    persistent
    maximized
    transition-show="slide-left"
    transition-hide="slide-right"
  >
    <q-card :style="cardStyle" class="media-preview-card">
      <!-- Header -->
      <q-card-section class="header row items-center q-pb-none">
        <div class="text-h6 ellipsis">
          {{ media.title || 'Pré-visualização de Mídia' }}
          <q-chip
            v-if="media.type"
            dense
            outline
            :color="getFileColor(media)"
            class="q-ml-sm"
          >
            {{ media.type.split('/')[1]?.toUpperCase() }}
          </q-chip>
        </div>
        
        <q-space />
        
        <q-btn
          flat
          round
          icon="close"
          color="white"
          class="close-btn"
          @click="handleHide"
        >
          <q-tooltip>Fechar (ESC)</q-tooltip>
        </q-btn>
      </q-card-section>

      <!-- Conteúdo -->
      <q-card-section class="content q-pa-md">
        <!-- Imagem -->
        <template v-if="isImage(media)">
          <q-img
            :src="media.src"
            spinner-color="primary"
            class="media-preview rounded-borders"
            @load="handleMediaLoad"
            @error="handleMediaError"
          >
            <template #loading>
              <div class="loading-state">
                <q-spinner-dots size="40px" color="primary" />
                <div class="text-subtitle1 q-mt-sm">
                  Carregando imagem...
                </div>
              </div>
            </template>
            
            <template #error>
              <div class="error-state">
                <q-icon name="error" size="40px" color="negative" />
                <div class="text-subtitle1 q-mt-sm">
                  Erro ao carregar imagem
                </div>
                <q-btn
                  flat
                  color="primary"
                  label="Tentar novamente"
                  class="q-mt-sm"
                  @click="retryLoad"
                />
              </div>
            </template>
          </q-img>
        </template>

        <!-- Vídeo -->
        <template v-else-if="isVideo(media)">
          <div class="video-container">
            <video
              controls
              class="media-preview rounded-borders"
              @loadeddata="handleMediaLoad"
              @error="handleMediaError"
            >
              <source :src="media.src" :type="media.type">
              <div class="error-state">
                Seu navegador não suporta a reprodução deste vídeo.
                <a :href="media.src" target="_blank" class="text-primary">
                  Clique aqui para baixar
                </a>
              </div>
            </video>
          </div>
        </template>

        <!-- Áudio -->
        <template v-else-if="isAudio(media)">
          <div class="audio-container">
            <q-icon 
              :name="getFileIcon(media)" 
              :color="getFileColor(media)"
              size="80px"
              class="q-mb-md"
            />
            <audio
              controls
              class="audio-player"
              @loadeddata="handleMediaLoad"
              @error="handleMediaError"
            >
              <source :src="media.src" :type="media.type">
              <div class="error-state">
                Seu navegador não suporta a reprodução deste áudio.
                <a :href="media.src" target="_blank" class="text-primary">
                  Clique aqui para baixar
                </a>
              </div>
            </audio>
          </div>
        </template>

        <!-- Outros tipos de arquivo -->
        <template v-else>
          <div class="file-preview">
            <q-icon 
              :name="getFileIcon(media)" 
              :color="getFileColor(media)"
              size="80px" 
            />
            <div class="text-h6 q-mt-md">
              {{ media.name }}
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              {{ formatFileSize(media.size) }}
            </div>
            <q-btn
              flat
              color="primary"
              :icon="getDownloadIcon(media)"
              label="Download"
              class="q-mt-lg"
              @click="downloadFile"
            />
          </div>
        </template>
      </q-card-section>

      <!-- Ações -->
      <q-card-actions align="right" class="actions q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          color="negative"
          icon="close"
          v-close-popup
        >
          <q-tooltip>ESC</q-tooltip>
        </q-btn>
        
        <q-btn
          ref="sendButton"
          flat
          label="Enviar"
          color="primary"
          icon="send"
          :loading="loading"
          :disable="!canSend"
          @click="$emit('send')"
        >
          <template #loading>
            <q-spinner-dots />
          </template>
          <q-tooltip>Enter</q-tooltip>
        </q-btn>
      </q-card-actions>

      <!-- Footer -->
      <footer class="footer row q-px-md q-pb-sm justify-end text-caption text-grey-7">
        <div>* Confirmar envio: Enter</div>
        <q-separator vertical spaced />
        <div>** Cancelar: ESC</div>
      </footer>
    </q-card>
  </q-dialog>
</template>

<script setup>
/**
 * Componente de modal para preview de mídia
 * @component
 * @description Exibe preview de diferentes tipos de mídia antes do envio
 */

import { computed } from 'vue'
import { useMediaPreview } from '../../composables/atendimento/useMediaPreview'

/**
 * Props do componente
 */
const props = defineProps({
  /** Estado de visibilidade do modal */
  modelValue: {
    type: Boolean,
    default: false
  },
  /** Objeto de mídia */
  media: {
    type: Object,
    default: () => ({
      title: '',
      src: '',
      type: '',
      name: '',
      size: 0
    }),
    required: true
  },
  /** Estado de carregamento */
  loading: {
    type: Boolean,
    default: false
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits(['update:modelValue', 'hide', 'send'])

/**
 * Composable de preview
 */
const {
  sendButton,
  cardStyle,
  canSend,
  isImage,
  isVideo,
  isAudio,
  getFileIcon,
  getFileColor,
  handleShow,
  handleHide,
  handleMediaLoad,
  handleMediaError,
  formatFileSize,
  getDownloadIcon,
  downloadFile,
  retryLoad
} = useMediaPreview()

/**
 * Model do diálogo
 */
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style lang="scss" scoped>
.media-preview-card {
  // Header
  .header {
    padding: 16px;
    background: var(--q-primary);
    color: white;

    .close-btn {
      opacity: 0.8;
      transition: all 0.3s ease;

      &:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }

  // Conteúdo
  .content {
    .media-preview {
      max-height: 60vh;
      width: 100%;
      border-radius: 8px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    }

    // Container de vídeo
    .video-container {
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      padding: 16px;
    }

    // Container de áudio
    .audio-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 8px;

      .audio-player {
        width: 100%;
        max-width: 400px;
        margin-top: 16px;
      }
    }

    // Preview de arquivo
    .file-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
    }

    // Estados de loading/erro
    .loading-state,
    .error-state {
      padding: 32px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
    }
  }

  // Ações
  .actions {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(0, 0, 0, 0.02);
  }

  // Footer
  .footer {
    font-size: 0.8em;
    opacity: 0.7;
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.02);
  }
}

// Tema escuro
:deep(.body--dark) {
  .media-preview-card {
    .content {
      .video-container,
      .audio-container,
      .file-preview,
      .loading-state,
      .error-state {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    .actions,
    .footer {
      border-color: rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.03);
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .media-preview-card {
    .content {
      .media-preview {
        max-height: 50vh;
      }

      .file-preview {
        padding: 24px;
      }

      .audio-container {
        padding: 16px;
      }
    }
  }
}

// Animações
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
