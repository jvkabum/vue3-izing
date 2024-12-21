<template>
  <q-dialog
    v-model="dialogModel"
    position="right"
    @hide="handleHide"
    @show="handleShow"
    persistent
  >
    <q-card :style="cardStyle" class="media-preview-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 ellipsis">
          {{ media.title || 'Pré-visualização' }}
        </div>
        
        <q-space />
        
        <q-btn
          flat
          round
          icon="close"
          color="negative"
          class="bg-padrao"
          @click="handleHide"
        >
          <q-tooltip>Fechar</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <!-- Imagem -->
        <template v-if="isImage">
          <q-img
            :src="media.src"
            spinner-color="primary"
            class="rounded-borders full-width"
            style="max-height: 60vh"
            @load="handleMediaLoad"
            @error="handleMediaError"
          >
            <template v-slot:loading>
              <div class="text-center q-pa-md">
                <q-spinner size="2em" />
                <div class="text-caption q-mt-sm">Carregando imagem...</div>
              </div>
            </template>
            
            <template v-slot:error>
              <div class="text-negative text-center q-pa-md">
                <q-icon name="error" size="2em" />
                <div class="text-caption q-mt-sm">Erro ao carregar imagem</div>
              </div>
            </template>
          </q-img>
        </template>

        <!-- Vídeo -->
        <template v-else-if="isVideo">
          <video
            controls
            class="rounded-borders full-width"
            style="max-height: 60vh"
            @loadeddata="handleMediaLoad"
            @error="handleMediaError"
          >
            <source :src="media.src" :type="media.type">
            Seu navegador não suporta a reprodução deste vídeo.
          </video>
        </template>

        <!-- Áudio -->
        <template v-else-if="isAudio">
          <div class="row justify-center q-pa-md">
            <audio
              controls
              class="rounded-borders"
              @loadeddata="handleMediaLoad"
              @error="handleMediaError"
            >
              <source :src="media.src" :type="media.type">
              Seu navegador não suporta a reprodução deste áudio.
            </audio>
          </div>
        </template>

        <!-- Outros tipos de arquivo -->
        <template v-else>
          <div class="row items-center justify-center q-pa-xl">
            <q-icon :name="fileIcon" size="4em" :color="fileColor" />
            <div class="text-h6 q-mt-md">{{ media.name }}</div>
          </div>
        </template>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          label="Cancelar"
          color="negative"
          flat
          v-close-popup
        />
        <q-btn
          ref="sendButton"
          label="Enviar"
          color="primary"
          :loading="loading"
          :disable="!mediaLoaded"
          @click="handleSend"
        >
          <template v-slot:loading>
            <q-spinner-dots />
          </template>
        </q-btn>
      </q-card-actions>

      <div class="row q-px-md q-pb-sm justify-end text-caption text-grey-7">
        <div>* Confirmar envio: Enter</div>
        <q-separator vertical spaced />
        <div>** Cancelar: ESC</div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  media: {
    type: Object,
    default: () => ({
      title: '',
      src: '',
      type: '',
      name: ''
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'hide', 'send'])

// Composables
const $q = useQuasar()

// Refs
const sendButton = ref(null)
const mediaLoaded = ref(false)

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const cardStyle = computed(() => 
  $q.screen.width < 770 
    ? 'height: 90vh; width: 98vw'
    : 'height: 90vh; width: 60vw'
)

const isImage = computed(() => 
  props.media.type?.startsWith('image/') || props.media.src?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
)

const isVideo = computed(() => 
  props.media.type?.startsWith('video/') || props.media.src?.match(/\.(mp4|webm|ogg)$/i)
)

const isAudio = computed(() => 
  props.media.type?.startsWith('audio/') || props.media.src?.match(/\.(mp3|wav|ogg)$/i)
)

const fileIcon = computed(() => {
  if (isImage.value) return 'mdi-file-image'
  if (isVideo.value) return 'mdi-file-video'
  if (isAudio.value) return 'mdi-file-music'
  if (props.media.type?.includes('pdf')) return 'mdi-file-pdf'
  if (props.media.type?.includes('word')) return 'mdi-file-word'
  if (props.media.type?.includes('excel')) return 'mdi-file-excel'
  return 'mdi-file-document'
})

const fileColor = computed(() => {
  if (isImage.value) return 'green'
  if (isVideo.value) return 'red'
  if (isAudio.value) return 'purple'
  if (props.media.type?.includes('pdf')) return 'negative'
  if (props.media.type?.includes('word')) return 'blue'
  if (props.media.type?.includes('excel')) return 'positive'
  return 'grey'
})

// Métodos
const handleShow = () => {
  mediaLoaded.value = !isImage.value && !isVideo.value && !isAudio.value
  setTimeout(() => {
    sendButton.value?.$el.focus()
  }, 100)
}

const handleHide = () => {
  mediaLoaded.value = false
  emit('hide')
}

const handleMediaLoad = () => {
  mediaLoaded.value = true
}

const handleMediaError = () => {
  mediaLoaded.value = false
  $q.notify({
    type: 'negative',
    message: 'Erro ao carregar mídia',
    position: 'top'
  })
}

const handleSend = () => {
  if (!mediaLoaded.value) return
  emit('send')
}
</script>

<style lang="scss" scoped>
.media-preview-card {
  .q-card__section {
    &:first-child {
      padding: 16px;
      background: var(--q-primary);
      color: white;
    }
  }
}

.bg-padrao {
  &.q-btn {
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.rounded-borders {
  border-radius: 8px;
}

audio {
  width: 100%;
  max-width: 400px;
}

.q-separator {
  &.vertical {
    margin: 0 8px;
  }
}

:deep(.q-img) {
  &__content {
    border-radius: 8px;
  }
}
</style>
