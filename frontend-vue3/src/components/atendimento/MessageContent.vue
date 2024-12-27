<template>
  <div>
    <!-- Conteúdo da mensagem baseado no tipo -->
    <component
      :is="getMessageComponent"
      :mensagem="mensagem"
      :url-media="urlMedia"
      :abrir-modal-imagem="abrirModalImagem"
      @update:abrir-modal-imagem="$emit('update:abrir-modal-imagem', $event)"
      @update:url-media="$emit('update:url-media', $event)"
      @open-contact-modal="$emit('open-contact-modal', $event)"
    />

    <!-- Corpo da mensagem -->
    <div
      v-if="!['vcard', 'application', 'audio'].includes(mensagem.mediaType)"
      :class="{ 'q-mt-sm': mensagem.mediaType !== 'chat' }"
      class="q-message-container row items-end no-wrap"
    >
      <span v-html="formatMessageBody(mensagem.body)" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMessageFormat } from '../../composables/atendimento/useMessageFormat'
import ContatoCard from './ContatoCard.vue'

const props = defineProps({
  mensagem: {
    type: Object,
    required: true
  },
  urlMedia: {
    type: String,
    default: ''
  },
  abrirModalImagem: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'update:abrir-modal-imagem',
  'update:url-media',
  'open-contact-modal'
])

const { formatMessageBody } = useMessageFormat()

const getMessageComponent = computed(() => {
  switch (props.mensagem.mediaType) {
    case 'audio':
      return 'audio-message'
    case 'vcard':
      return ContatoCard
    case 'location':
    case 'image':
      return 'media-preview'
    case 'video':
      return 'video-message'
    default:
      return 'text-message'
  }
})
</script>
