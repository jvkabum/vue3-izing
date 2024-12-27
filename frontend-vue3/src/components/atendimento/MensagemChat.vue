<template>
  <div class="q-pa-md">
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-for="(mensagem, index) in mensagens" :key="mensagem.id">
        <hr
          v-if="isLineDate"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formatarData(mensagem.createdAt)"
          v-show="index === 0 || formatarData(mensagem.createdAt) !== formatarData(mensagens[index - 1].createdAt)"
        >
        <div
          v-if="mensagens.length && index === mensagens.length - 1"
          ref="lastMessageRef"
          id="lastMessageRef"
          style="float: 'left'; background:'black'; clear: 'both'"
        />
        <div :id="`chat-message-${mensagem.id}`" />
        <q-chat-message
          :stamp="dataInWords(mensagem.createdAt)"
          :sent="mensagem.fromMe"
          class="text-weight-medium"
          :bg-color="mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1'"
          :class="{ pulseIdentications: identificarMensagem === `chat-message-${mensagem.id}` }"
        >
          <div
            style="min-width: 100px; max-width: 350px;"
            :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''"
          >
            <q-checkbox
              v-if="ativarMultiEncaminhamento"
              :key="`cheked-chat-message-${mensagem.id}`"
              :class="{
                'absolute-top-right checkbox-encaminhar-right': !mensagem.fromMe,
                'absolute-top-left checkbox-encaminhar-left': mensagem.fromMe
              }"
              :ref="`box-chat-message-${mensagem.id}`"
              @click.native="handleVerificarEncaminharMensagem(mensagem)"
              :value="false"
            />

            <q-icon
              class="q-ma-xs"
              name="mdi-calendar"
              size="18px"
              :class="{
                'text-primary': mensagem.scheduleDate && mensagem.status === 'pending',
                'text-positive': !['pending', 'canceled'].includes(mensagem.status)
              }"
              v-if="mensagem.scheduleDate"
            >
              <q-tooltip content-class="bg-secondary text-grey-8">
                <div class="row col">Mensagem agendada</div>
                <div class="row col" v-if="mensagem.isDeleted">
                  <q-chip color="red-3" icon="mdi-trash-can-outline">
                    Envio cancelado: {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip color="blue-1" icon="mdi-calendar-import">
                    Criado em: {{ formatarData(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip color="blue-1" icon="mdi-calendar-start">
                    Programado para: {{ formatarData(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }}
                  </q-chip>
                </div>
              </q-tooltip>
            </q-icon>

            <div v-if="mensagem.edited" class="text-italic">
              Editada: {{ mensagem.edited }}
            </div>
            <div v-if="mensagem.edited" class="text-italic">
              Mensagem anterior:<br>
            </div>
            <div v-if="mensagem.isDeleted" class="text-italic">
              Mensagem apagada em {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}.
            </div>
            <div
              v-if="isGroupLabel(mensagem, ticketFocado)"
              class="q-mb-sm"
              style="display: flex; color: rgb(59 23 251); font-weight: 500;"
            >
              {{ isGroupLabel(mensagem, ticketFocado) }}
            </div>

            <div v-if="mensagem.quotedMsg" :class="{ 'textContentItem': !mensagem.isDeleted, 'textContentItemDeleted': mensagem.isDeleted }">
              <MensagemRespondida
                style="max-width: 240px; max-height: 150px"
                class="row justify-center"
                @mensagem-respondida:focar-mensagem="focarMensagem"
                :mensagem="mensagem.quotedMsg"
              />
            </div>

            <q-btn
              v-if="!mensagem.isDeleted && isShowOptions"
              class="absolute-top-right mostar-btn-opcoes-chat"
              dense
              flat
              ripple
              round
              icon="mdi-chevron-down"
            >
              <q-menu square auto-close anchor="bottom left" self="top left">
                <q-list style="min-width: 100px">
                  <q-item
                    :disable="!['whatsapp', 'telegram'].includes(ticketFocado.channel)"
                    clickable
                    @click="$emit('update:replyingMessage', mensagem)"
                  >
                    <q-item-section>Responder</q-item-section>
                    <q-tooltip v-if="!['whatsapp', 'telegram'].includes(ticketFocado.channel)">
                      Disponível apenas para WhatsApp e Telegram
                    </q-tooltip>
                  </q-item>
                  <q-item clickable @click="$emit('mensagem-chat:encaminhar-mensagem', mensagem)">
                    <q-item-section>Encaminhar</q-item-section>
                  </q-item>
                  <q-item clickable @click="handleMarcarMensagensParaEncaminhar(mensagem)">
                    <q-item-section>Marcar (encaminhar várias)</q-item-section>
                  </q-item>
                  <q-item
                    @click="handleAbrirModalEditarMensagem(mensagem)"
                    clickable
                    v-if="mensagem.fromMe && mensagem.mediaType === 'chat'"
                    :disable="ticketFocado.channel === 'messenger'"
                  >
                    <q-item-section>
                      <q-item-label>Editar Mensagem</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    @click="handleDeletarMensagem(mensagem)"
                    clickable
                    v-if="mensagem.fromMe"
                    :disable="isDesactivatDelete(mensagem) || ticketFocado.channel === 'messenger'"
                  >
                    <q-item-section>
                      <q-item-label>Deletar</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>

            <q-icon
              v-if="mensagem.fromMe"
              class="absolute-bottom-right q-pr-xs q-pb-xs"
              :name="ackIcons[mensagem.ack]"
              size="1.2em"
              :color="mensagem.ack >= 3 ? 'blue-12' : ''"
            />

            <template v-if="mensagem.mediaType === 'audio'">
              <div style="width: 330px; height: 300px">
                <audio
                  class="q-mt-md full-width"
                  controls
                  ref="audioMessage"
                  controlsList="nodownload volume novolume"
                >
                  <source :src="mensagem.mediaUrl" type="audio/mp3" />
                </audio>
              </div>
            </template>

            <template v-if="mensagem.mediaType === 'vcard'">
              <div style="min-width: 250px;">
                <ContatoCard
                  :mensagem="mensagem"
                  @openContactModal="openContactModal"
                />
              </div>
            </template>

            <template v-if="mensagem.mediaType === 'location'">
              <q-img
                @click="handleLocationClick(mensagem)"
                src="../../assets/localizacao.png"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer;"
              />
            </template>

            <template v-if="mensagem.mediaType === 'image'">
              <q-img
                @click="handleImageClick(mensagem)"
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
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
                class="q-mt-md"
                style="object-fit: cover; width: 330px; height: 150px; border-radius: 8px;"
              />
            </template>

            <template v-if="!['audio', 'vcard', 'image', 'video'].includes(mensagem.mediaType) && mensagem.mediaUrl">
              <div class="text-center full-width hide-scrollbar no-scroll">
                <iframe
                  v-if="isPDF(mensagem.mediaUrl)"
                  frameBorder="0"
                  scrolling="no"
                  style="width: 330px; height: 150px; overflow-y: hidden;"
                  class="no-scroll hide-scrollbar"
                  :src="mensagem.mediaUrl"
                  id="frame-pdf"
                >
                  Faça download do PDF
                </iframe>
                <q-btn
                  type="a"
                  :color="$q.dark.isActive ? '' : 'grey-3'"
                  no-wrap
                  no-caps
                  stack
                  dense
                  class="q-mt-sm text-center text-black btn-rounded text-grey-9 ellipsis"
                  download
                  :target="isPDF(mensagem.mediaUrl) ? '_blank' : ''"
                  :href="mensagem.mediaUrl"
                >
                  <q-tooltip v-if="mensagem.mediaUrl" content-class="text-bold">
                    Baixar: {{ mensagem.mediaName }}
                    {{ mensagem.body }}
                  </q-tooltip>
                  <div class="row items-center q-ma-xs">
                    <div class="ellipsis col-grow q-pr-sm" style="max-width: 290px">
                      {{ farmatarMensagemWhatsapp(mensagem.body || mensagem.mediaName) }}
                    </div>
                    <q-icon name="mdi-download" />
                  </div>
                </q-btn>
              </div>
            </template>

            <div
              v-if="!['vcard', 'application', 'audio'].includes(mensagem.mediaType)"
              :class="{ 'q-mt-sm': mensagem.mediaType !== 'chat' }"
              class="q-message-container row items-end no-wrap"
            >
              <span>{{ farmatarMensagemWhatsapp(mensagem.body) }}</span>
            </div>
          </div>
        </q-chat-message>
      </div>
    </transition-group>

    <q-dialog v-model="showModaledit">
      <q-card>
        <q-card-section>
          <div class="text-h6">Editar Mensagem</div>
        </q-card-section>
        <q-card-section>
          <q-input filled v-model="mensagemAtual.body" label="Mensagem" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancelar" color="negative" v-close-popup />
          <q-btn label="Salvar" color="primary" @click="handleSalvarMensagem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useStore } from 'src/stores'
import { useMensagemChat } from 'src/composables/atendimento/useMensagemChat'
import { useCommon } from 'src/composables/useCommon'
import VueEasyLightbox from 'vue-easy-lightbox'
import MensagemRespondida from './MensagemRespondida.vue'
import ContatoCard from './ContatoCard.vue'

const props = defineProps({
  mensagem: {
    type: Object,
    required: true
  },
  mensagens: {
    type: Array,
    default: () => []
  },
  mensagensParaEncaminhar: {
    type: Array,
    default: () => []
  },
  size: {
    type: [String, Number],
    default: '5'
  },
  isLineDate: {
    type: Boolean,
    default: true
  },
  isShowOptions: {
    type: Boolean,
    default: true
  },
  ativarMultiEncaminhamento: {
    type: Boolean,
    default: false
  },
  replyingMessage: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'update:mensagensParaEncaminhar',
  'update:ativarMultiEncaminhamento',
  'update:replyingMessage',
  'mensagem-chat:encaminhar-mensagem'
])

const $q = useQuasar()
const store = useStore()
const { ticketFocado } = storeToRefs(store)
const { dataInWords, formatarData, farmatarMensagemWhatsapp } = useCommon()

const {
  modalContato,
  currentContact,
  mensagemAtual,
  showModaledit,
  abrirModalImagem,
  urlMedia,
  identificarMensagem,
  ackIcons,
  openContactModal,
  closeModal,
  saveContact,
  salvarMensagem,
  abrirModalEditarMensagem,
  verificarEncaminharMensagem,
  isPDF,
  isGroupLabel,
  isDesactivatDelete,
  buscarImageCors,
  deletarMensagem,
  focarMensagem
} = useMensagemChat()

const handleVerificarEncaminharMensagem = (mensagem) => {
  try {
    const mensagens = verificarEncaminharMensagem(mensagem, props.mensagensParaEncaminhar, $refs)
    emit('update:mensagensParaEncaminhar', mensagens)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  }
}

const handleMarcarMensagensParaEncaminhar = (mensagem) => {
  emit('update:mensagensParaEncaminhar', [])
  emit('update:ativarMultiEncaminhamento', !props.ativarMultiEncaminhamento)
}

const handleAbrirModalEditarMensagem = (mensagem) => {
  abrirModalEditarMensagem(mensagem)
}

const handleSalvarMensagem = async () => {
  try {
    const updatedMessage = await salvarMensagem()
    const index = props.mensagens.findIndex(msg => msg.id === updatedMessage.id)
    if (index !== -1) {
      props.mensagens.splice(index, 1, updatedMessage)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  }
}

const handleDeletarMensagem = async (mensagem) => {
  try {
    const success = await deletarMensagem(mensagem)
    if (success) {
      mensagem.isDeleted = true
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  }
}

const handleImageClick = (mensagem) => {
  urlMedia.value = mensagem.mediaUrl
  abrirModalImagem.value = true
}

const handleLocationClick = (mensagem) => {
  urlMedia.value = mensagem.mediaUrl
  abrirModalImagem.value = false
}

onMounted(() => {
  window.dispatchEvent(new CustomEvent('scrollToBottomMessageChat'))
})
</script>

<style lang="scss">
.frame-pdf {
  overflow: hidden;
}

.checkbox-encaminhar-right {
  right: -35px;
  z-index: 99999;
}

.checkbox-encaminhar-left {
  left: -35px;
  z-index: 99999;
}

.pulseIdentications {
  animation: pulse-blue 1.5s infinite;
}

@keyframes pulse-blue {
  0% {
    background-color: rgba(0, 0, 255, 0.1);
    transform: scale(1);
  }
  50% {
    background-color: rgba(0, 0, 255, 0.3);
    transform: scale(1.02);
  }
  100% {
    background-color: rgba(0, 0, 255, 0.1);
    transform: scale(1);
  }
}
</style>
