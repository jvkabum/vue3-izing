<template>
  <q-item
    clickable
    v-ripple
    class="q-pa-none fit btn-rounded q-mt-md q-mb-sm row justify-center"
    dense
    @click="$emit('mensagem-respondida:focar-mensagem', mensagem)"
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
        <div v-if="mensagem.isDeleted" class="text-italic">
          Mensagem apagada em {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}.
        </div>
        <div
          v-if="isGroupLabel(mensagem)"
          class="q-mb-sm"
          style="display: flex; color: rgb(59 23 251); font-weight: 500;"
        >
          {{ isGroupLabel(mensagem) }}
        </div>
        <div
          v-if="!isGroupLabel(mensagem) && !mensagem.fromMe"
          class="q-mb-sm"
          style="display: flex; color: rgb(59 23 251); font-weight: 500;"
        >
          {{ mensagem.contact?.name }}
        </div>

        <template v-if="mensagem.mediaType === 'audio'">
          <div style="width: 200px; height: 300px">
            <audio style="max-width: 200px;" class="full-width" controls>
              <source :src="mensagem.mediaUrl" type="audio/mp3" />
            </audio>
          </div>
        </template>

        <template v-if="mensagem.mediaType === 'vcard'">
          <q-btn
            type="a"
            color="black"
            outline
            dense
            class="q-px-sm text-center"
            download="vCard"
            :href="`data:text/x-vcard;charset=utf-8;base64,${returnCardContato(mensagem.body)}`"
          >
            Download Contato
          </q-btn>
        </template>

        <template v-if="mensagem.mediaType === 'image'">
          <q-img
            @click="handleImageClick"
            :src="mensagem.mediaUrl"
            spinner-color="primary"
            height="60px"
            width="130px"
            style="cursor: pointer;"
          />
          <VueEasyLightbox
            moveDisabled
            :visible="abrirModalImagem"
            :imgs="urlMedia"
            :index="mensagem.ticketId || 1"
            @hide="abrirModalImagem = false"
          />
        </template>

        <template v-if="mensagem.mediaType === 'video'">
          <video
            :src="mensagem.mediaUrl"
            controls
            style="object-fit: cover; width: 130px; height: 60px; border-radius: 8px;"
          />
        </template>

        <template v-if="mensagem.mediaType === 'application'">
          <div class="text-center">
            <q-btn
              type="a"
              color="grey-3"
              no-wrap
              no-caps
              stack
              class="q-my-sm text-center text-black btn-rounded text-grey-9 ellipsis"
              download
              :target="isPDF(mensagem.mediaUrl) ? '_blank' : ''"
              :href="mensagem.mediaUrl"
            >
              <q-tooltip v-if="mensagem.mediaUrl" content-class="bg-padrao text-grey-9 text-bold">
                Baixar: {{ mensagem.body }}
              </q-tooltip>
              <div class="row items-center q-my-sm" style="max-width: 180px">
                <div class="ellipsis col-grow q-pr-sm">
                  {{ farmatarMensagemWhatsapp(mensagem.body) }}
                </div>
                <q-icon class="col" name="mdi-download" />
              </div>
            </q-btn>
          </div>
        </template>

        <div
          v-if="!['vcard', 'application', 'audio', 'image', 'video'].includes(mensagem.mediaType)"
          :class="{ 'q-mt-sm': mensagem.mediaType !== 'chat' }"
          class="q-message-container row items-end no-wrap ellipsis-3-lines"
        >
          <span>{{ farmatarMensagemWhatsapp(mensagem.body) }}</span>
        </div>
      </div>
    </q-chat-message>
  </q-item>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useStore } from 'src/stores'
import { useCommon } from 'src/composables/useCommon'
import { Base64 } from 'js-base64'
import VueEasyLightbox from 'vue-easy-lightbox'

const props = defineProps({
  mensagem: {
    type: Object,
    default: () => ({})
  },
  size: {
    type: [String, Number],
    default: '5'
  },
  isLineDate: {
    type: Boolean,
    default: true
  },
  replyingMessage: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['mensagem-respondida:focar-mensagem'])

const $q = useQuasar()
const store = useStore()
const { ticketFocado } = storeToRefs(store)
const { formatarData, farmatarMensagemWhatsapp } = useCommon()

const abrirModalImagem = ref(false)
const urlMedia = ref('')

const isPDF = (url) => {
  if (!url) return false
  const split = url.split('.')
  const ext = split[split.length - 1]
  return ext === 'pdf'
}

const isGroupLabel = (mensagem) => {
  try {
    return ticketFocado.value.isGroup ? mensagem.contact.name : ''
  } catch (error) {
    return ''
  }
}

const returnCardContato = (str) => {
  return Base64.encode(str)
}

const handleImageClick = () => {
  urlMedia.value = props.mensagem.mediaUrl
  abrirModalImagem.value = true
}
</script>
