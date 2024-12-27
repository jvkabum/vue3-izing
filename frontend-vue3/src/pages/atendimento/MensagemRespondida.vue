<template>
  <div>
    <q-item
      clickable
      v-ripple
      class="q-pa-none fit btn-rounded q-mt-md q-mb-sm row justify-center"
      dense
    >
      <q-chat-message
        :key="mensagem.id"
        :sent="mensagem.fromMe"
        class="text-weight-medium fit q-ma-none"
        id="chat-message-resp"
        style="min-width: 100px; max-width: 350px"
        :bg-color="mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1'"
      >
        <div
          class="full-width"
          :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''"
        >
          <div
            v-if="mensagem.isDeleted"
            class="text-italic"
          >
            Mensagem apagada em {{ formattedDate }}.
          </div>
          <div
            v-if="isGroupMessage"
            class="q-mb-sm"
            style="display: flex; color: rgb(59 23 251); font-weight: 500;"
          >
            {{ mensagem.contact?.name }}
          </div>
          <div
            v-if="!isGroupMessage && !mensagem.fromMe"
            class="q-mb-sm"
            style="display: flex; color: rgb(59 23 251); font-weight: 500;"
          >
            {{ mensagem.contact?.name }}
          </div>

          <!-- Componentes de mídia -->
          <component
            :is="mediaComponent"
            v-if="mediaType"
            :message="mensagem"
            @click="handleMediaClick"
          />

          <!-- Corpo da mensagem -->
          <div
            v-linkified
            v-if="!mediaType"
            class="q-message-container row items-end no-wrap ellipsis-3-lines"
            v-html="formattedBody"
          />
        </div>
      </q-chat-message>
    </q-item>

    <!-- Lightbox para imagens -->
    <VueEasyLightbox
      moveDisabled
      :visible="isLightboxVisible"
      :imgs="mensagem.mediaUrl"
      :index="mensagem.ticketId || 1"
      @hide="closeLightbox"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import VueEasyLightbox from 'vue-easy-lightbox'
import { useMessageFormat } from 'src/composables/atendimento/useMessageFormat'
import { useMediaPreview } from 'src/composables/atendimento/useMediaPreview'

// Props
const props = defineProps({
  mensagem: {
    type: Object,
    required: true
  },
  ticketFocado: {
    type: Object,
    default: () => ({})
  }
})

// Composables
const $q = useQuasar()
const { formattedDate, formatBody, getMediaType } = useMessageFormat({ message: props.mensagem })
const { openMedia } = useMediaPreview()

// Estado
const isLightboxVisible = ref(false)

// Computed
const formattedBody = computed(() => formatBody(props.mensagem.body))

const isGroupMessage = computed(() => 
  props.ticketFocado?.isGroup && props.mensagem.contact?.name
)

const mediaType = computed(() => 
  props.mensagem.mediaUrl ? getMediaType(props.mensagem.mediaUrl) : null
)

const mediaComponent = computed(() => {
  switch (mediaType.value) {
    case 'audio':
      return 'audio-message'
    case 'image':
      return 'media-preview'
    case 'video':
      return 'video-message'
    case 'document':
      return 'document-preview'
    default:
      return null
  }
})

// Métodos
const handleMediaClick = () => {
  if (mediaType.value === 'image') {
    isLightboxVisible.value = true
  } else {
    openMedia(props.mensagem)
  }
}

const closeLightbox = () => {
  isLightboxVisible.value = false
}
</script>

<style lang="scss" scoped>
.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
