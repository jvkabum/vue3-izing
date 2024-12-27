<script setup lang="ts">
import { ref, computed } from 'vue'
import { Base64 } from 'js-base64'
import { useQuasar } from 'quasar'
import VueEasyLightbox from 'vue-easy-lightbox'
import { format } from 'date-fns'
import type { Message, Ticket } from '../../types/message.types'

// Props
const props = defineProps<{
  mensagem: Message
  size?: string | number
  isLineDate?: boolean
  replyingMessage?: Message
  ticketFocado?: Ticket
}>()

// Composables
const $q = useQuasar()

// Estado
const isLightboxVisible = ref(false)

// Composable para mensagem
const useMensagem = () => {
  const bgColor = computed(() => 
    props.mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1'
  )

  const groupLabel = computed(() => 
    props.ticketFocado?.isGroup ? props.mensagem.contact?.name ?? '' : ''
  )

  const vcardUrl = computed(() => 
    `data:text/x-vcard;charset=utf-8;base64,${Base64.encode(props.mensagem.body)}`
  )

  const formattedDate = computed(() => 
    format(new Date(props.mensagem.updatedAt), 'dd/MM/yyyy')
  )

  const formattedMessageBody = computed(() => props.mensagem.body)

  const isFileTypePDF = (url?: string) => 
    url?.split('.').pop()?.toLowerCase() === 'pdf' || false

  return {
    bgColor,
    groupLabel,
    vcardUrl,
    formattedDate,
    formattedMessageBody,
    isFileTypePDF
  }
}

// Composable para lightbox
const useLightbox = () => {
  const showLightbox = () => {
    isLightboxVisible.value = true
  }

  const hideLightbox = () => {
    isLightboxVisible.value = false
  }

  return {
    isLightboxVisible,
    showLightbox,
    hideLightbox
  }
}

// Extrair composables
const { 
  bgColor,
  groupLabel,
  vcardUrl,
  formattedDate,
  formattedMessageBody,
  isFileTypePDF
} = useMensagem()

const {
  isLightboxVisible: lightboxVisible,
  showLightbox,
  hideLightbox
} = useLightbox()
</script>

<template>
  <q-item
    clickable
    v-ripple
    class="q-pa-none fit btn-rounded q-mt-md q-mb-sm row justify-center"
    dense
  >
    <q-chat-message
      :key="props.mensagem.id"
      :sent="props.mensagem.fromMe"
      class="text-weight-medium fit q-ma-none"
      id="chat-message-resp"
      style="min-width: 100px; max-width: 350px"
      :bg-color="bgColor"
    >
      <div
        class="full-width"
        :style="props.mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''"
      >
        <div
          v-if="props.mensagem.isDeleted"
          class="text-italic"
        >
          Mensagem apagada em {{ formattedDate }}.
        </div>
        <div
          v-if="groupLabel"
          class="q-mb-sm"
          style="display: flex; color: rgb(59 23 251); font-weight: 500;"
        >
          {{ groupLabel }}
        </div>
        <div
          v-if="!groupLabel && !props.mensagem.fromMe"
          class="q-mb-sm"
          style="display: flex; color: rgb(59 23 251); font-weight: 500;"
        >
          {{ props.mensagem.contact?.name }}
        </div>

        <template v-if="props.mensagem.mediaType === 'audio'">
          <div style="width: 200px; height: 300px">
            <audio
              style="max-width: 200px;"
              class="full-width"
              controls
            >
              <source :src="props.mensagem.mediaUrl" type="audio/mp3">
            </audio>
          </div>
        </template>

        <template v-if="props.mensagem.mediaType === 'vcard'">
          <q-btn
            type="a"
            color="black"
            outline
            dense
            class="q-px-sm text-center"
            download="vCard"
            :href="vcardUrl"
          >
            Download Contato
          </q-btn>
        </template>

        <template v-if="props.mensagem.mediaType === 'image'">
          <q-img
            @click="showLightbox"
            :src="props.mensagem.mediaUrl"
            spinner-color="primary"
            height="60px"
            width="130px"
            style="cursor: pointer;"
          />
          <VueEasyLightbox
            moveDisabled
            :visible="lightboxVisible"
            :imgs="props.mensagem.mediaUrl"
            :index="props.mensagem.ticketId || 1"
            @hide="hideLightbox"
          />
        </template>

        <template v-if="props.mensagem.mediaType === 'video'">
          <video
            :src="props.mensagem.mediaUrl"
            controls
            style="object-fit: cover; width: 130px; height: 60px; border-radius: 8px;"
          />
        </template>

        <template v-if="props.mensagem.mediaType === 'application'">
          <div class="text-center">
            <q-btn
              type="a"
              color="grey-3"
              no-wrap
              no-caps
              stack
              class="q-my-sm text-center text-black btn-rounded text-grey-9 ellipsis"
              download
              :target="isFileTypePDF(props.mensagem.mediaUrl) ? '_blank' : ''"
              :href="props.mensagem.mediaUrl"
            >
              <q-tooltip
                v-if="props.mensagem.mediaUrl"
                content-class="bg-padrao text-grey-9 text-bold"
              >
                Baixar: {{ props.mensagem.body }}
              </q-tooltip>
              <template #default>
                <div
                  class="row items-center q-my-sm"
                  style="max-width: 180px"
                >
                  <div class="ellipsis col-grow q-pr-sm">
                    {{ formattedMessageBody }}
                  </div>
                  <q-icon
                    class="col"
                    name="mdi-download"
                  />
                </div>
              </template>
            </q-btn>
          </div>
        </template>

        <div
          v-linkified
          v-if="!['vcard', 'application', 'audio', 'image', 'video'].includes(props.mensagem.mediaType)"
          :class="{'q-mt-sm': props.mensagem.mediaType !== 'chat'}"
          class="q-message-container row items-end no-wrap ellipsis-3-lines"
          v-html="formattedMessageBody"
        />
      </div>
    </q-chat-message>
  </q-item>
</template>

<style lang="scss" scoped>
</style>
