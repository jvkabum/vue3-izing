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
          :key="'hr-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formattedDate(mensagem.createdAt)"
          v-show="index === 0 || formattedDate(mensagem.createdAt) !== formattedDate(mensagens[index - 1].createdAt)"
        >
        <template v-if="mensagens.length && index === mensagens.length - 1">
          <div
            :key="`ref-${mensagem.createdAt}`"
            ref="lastMessageRef"
            id="lastMessageRef"
            style="float: 'left', background: 'black', clear: 'both'"
          />
        </template>
        <div
          :key="`chat-message-${mensagem.id}`"
          :id="`chat-message-${mensagem.id}`"
        />
        <q-chat-message
          :key="mensagem.id"
          :stamp="formattedDate(mensagem.createdAt)"
          :sent="mensagem.fromMe"
          class="text-weight-medium"
          :bg-color="mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1'"
          :class="{ pulseIdentications: identificarMensagem === `chat-message-${mensagem.id}` }"
        >
          <div
            style="min-width: 100px; max-width: 350px;"
            :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''"
          >
            <!-- Checkbox para encaminhamento múltiplo -->
            <q-checkbox
              v-if="ativarMultiEncaminhamento"
              :key="`cheked-chat-message-${mensagem.id}`"
              :class="{
                'absolute-top-right checkbox-encaminhar-right': !mensagem.fromMe,
                'absolute-top-left checkbox-encaminhar-left': mensagem.fromMe
              }"
              :ref="`box-chat-message-${mensagem.id}`"
              @click="handleForwardCheck(mensagem)"
              :model-value="isMessageSelected(mensagem)"
            />

            <!-- Ícone de agendamento -->
            <q-icon
              v-if="mensagem.scheduleDate"
              class="q-ma-xs"
              name="mdi-calendar"
              size="18px"
              :class="{
                'text-primary': mensagem.scheduleDate && mensagem.status === 'pending',
                'text-positive': !['pending', 'canceled'].includes(mensagem.status)
              }"
            >
              <q-tooltip content-class="bg-secondary text-grey-8">
                <div class="row col">Mensagem agendada</div>
                <div v-if="mensagem.isDeleted" class="row col">
                  <q-chip color="red-3" icon="mdi-trash-can-outline">
                    Envio cancelado: {{ formattedDate(mensagem.updatedAt, 'dd/MM/yyyy') }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip color="blue-1" icon="mdi-calendar-import">
                    Criado em: {{ formattedDate(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip color="blue-1" icon="mdi-calendar-start">
                    Programado para: {{ formattedDate(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }}
                  </q-chip>
                </div>
              </q-tooltip>
            </q-icon>

            <!-- Status de edição -->
            <div v-if="mensagem.edited" class="text-italic">
              Editada: {{ mensagem.edited }}
            </div>
            <div v-if="mensagem.edited" class="text-italic">
              Mensagem anterior:<br>
            </div>

            <!-- Status de exclusão -->
            <div v-if="mensagem.isDeleted" class="text-italic">
              Mensagem apagada em {{ formattedDate(mensagem.updatedAt, 'dd/MM/yyyy') }}.
            </div>

            <!-- Label de grupo -->
            <div
              v-if="isGroupLabel(mensagem)"
              class="q-mb-sm"
              style="display: flex; color: rgb(59 23 251); font-weight: 500;"
            >
              {{ isGroupLabel(mensagem) }}
            </div>

            <!-- Mensagem respondida -->
            <div
              v-if="mensagem.quotedMsg"
              :class="{ 'textContentItem': !mensagem.isDeleted, 'textContentItemDeleted': mensagem.isDeleted }"
            >
              <MensagemRespondida
                style="max-width: 240px; max-height: 150px"
                class="row justify-center"
                @mensagem-respondida:focar-mensagem="focarMensagem"
                :mensagem="mensagem.quotedMsg"
              />
            </div>

            <!-- Menu de opções -->
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
                    @click="citarMensagem(mensagem)"
                  >
                    <q-item-section>Responder</q-item-section>
                    <q-tooltip v-if="!['whatsapp', 'telegram'].includes(ticketFocado.channel)">
                      Disponível apenas para WhatsApp e Telegram
                    </q-tooltip>
                  </q-item>
                  <q-item clickable @click="encaminharMensagem(mensagem)">
                    <q-item-section>Encaminhar</q-item-section>
                  </q-item>
                  <q-item clickable @click="marcarMensagensParaEncaminhar(mensagem)">
                    <q-item-section>Marcar (encaminhar várias)</q-item-section>
                  </q-item>
                  <q-item
                    v-if="mensagem.fromMe && mensagem.mediaType === 'chat'"
                    :disable="ticketFocado.channel === 'messenger'"
                    clickable
                    @click="abrirModalEditarMensagem(mensagem)"
                  >
                    <q-item-section>
                      <q-item-label>Editar Mensagem</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    v-if="mensagem.fromMe"
                    :disable="isDesactivatDelete(mensagem) || ticketFocado.channel === 'messenger'"
                    clickable
                    @click="deletarMensagem(mensagem)"
                  >
                    <q-item-section>
                      <q-item-label>Deletar</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>

            <!-- Ícone de status -->
            <q-icon
              v-if="mensagem.fromMe"
              class="absolute-bottom-right q-pr-xs q-pb-xs"
              :name="ackIcons[mensagem.ack]"
              size="1.2em"
              :color="mensagem.ack >= 3 ? 'blue-12' : ''"
            />

            <!-- Conteúdo da mensagem baseado no tipo -->
            <component
              :is="getMessageComponent(mensagem)"
              :mensagem="mensagem"
              :url-media="urlMedia"
              :abrir-modal-imagem="abrirModalImagem"
              @update:abrir-modal-imagem="abrirModalImagem = $event"
              @update:url-media="urlMedia = $event"
              @open-contact-modal="openContactModal"
            />

            <!-- Corpo da mensagem -->
            <div
              v-if="!['vcard', 'application', 'audio'].includes(mensagem.mediaType)"
              :class="{ 'q-mt-sm': mensagem.mediaType !== 'chat' }"
              class="q-message-container row items-end no-wrap"
              v-html="formatBody(mensagem.body)"
            />
          </div>
        </q-chat-message>
      </template>
    </transition-group>

    <!-- Modal de edição -->
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
          <q-btn label="Salvar" color="primary" @click="salvarMensagem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useAtendimentoStore } from '../../stores/atendimento'
import { useMensagemChat } from '../../composables/atendimento/useMensagemChat'
import { useMessageFormat } from '../../composables/atendimento/useMessageFormat'
import VueEasyLightbox from 'vue-easy-lightbox'
import MensagemRespondida from './MensagemRespondida.vue'
import ContatoCard from './ContatoCard.vue'
import ContatoModal from './ContatoModal.vue'

// Props
const props = defineProps({
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

// Emits
const emit = defineEmits([
  'update:replyingMessage',
  'update:mensagensParaEncaminhar',
  'update:ativarMultiEncaminhamento',
  'mensagem-chat:encaminhar-mensagem'
])

// Composables
const $q = useQuasar()
const atendimentoStore = useAtendimentoStore()
const { ticketFocado } = storeToRefs(atendimentoStore)

const {
  modalContato,
  currentContact,
  mensagemAtual,
  showModaledit,
  abrirModalImagem,
  urlMedia,
  identificarMensagem,
  loading,
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

const {
  formattedDate,
  messageClasses,
  messageStyle,
  formatBody,
  getMediaType
} = useMessageFormat({ message: props.mensagens[0] })

// Métodos
const handleForwardCheck = (mensagem) => {
  const novasMensagens = verificarEncaminharMensagem(
    mensagem,
    props.mensagensParaEncaminhar,
    $refs
  )
  emit('update:mensagensParaEncaminhar', novasMensagens)
}

const citarMensagem = (mensagem) => {
  emit('update:replyingMessage', mensagem)
  window.$root.$emit('mensagem-chat:focar-input-mensagem', mensagem)
}

const encaminharMensagem = (mensagem) => {
  emit('mensagem-chat:encaminhar-mensagem', mensagem)
}

const marcarMensagensParaEncaminhar = (mensagem) => {
  emit('update:mensagensParaEncaminhar', [])
  emit('update:ativarMultiEncaminhamento', !props.ativarMultiEncaminhamento)
}

const isMessageSelected = (mensagem) => {
  return props.mensagensParaEncaminhar.some(m => m.id === mensagem.id)
}

const getMessageComponent = (mensagem) => {
  switch (mensagem.mediaType) {
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
}

// Lifecycle
onMounted(() => {
  const messageList = document.getElementById('messageListStart')
  if (messageList) {
    messageList.scrollIntoView({ behavior: 'smooth' })
  }
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

.message-bubble {
  transition: all 0.3s ease;
  
  &:hover {
    .mostar-btn-opcoes-chat {
      opacity: 1;
    }
  }
}

.mostar-btn-opcoes-chat {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pulseIdentications {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
