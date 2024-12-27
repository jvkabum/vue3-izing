<template>
  <div class="q-pa-md">
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-for="(mensagem, index) in mensagens" :key="mensagem.id">
        <!-- Data separator -->
        <hr
          v-if="isLineDate"
          :key="'hr-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formattedDate(mensagem.createdAt)"
          v-show="index === 0 || formattedDate(mensagem.createdAt) !== formattedDate(mensagens[index - 1].createdAt)"
        >
        
        <!-- Last message reference -->
        <div
          v-if="mensagens.length && index === mensagens.length - 1"
          :key="`ref-${mensagem.createdAt}`"
          ref="lastMessageRef"
          id="lastMessageRef"
          style="float: 'left', background: 'black', clear: 'both'"
        />
        
        <!-- Message container -->
        <div
          :key="`chat-message-${mensagem.id}`"
          :id="`chat-message-${mensagem.id}`"
        >
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
              <!-- Forward checkbox -->
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

              <!-- Schedule icon -->
              <MessageScheduleIcon 
                v-if="mensagem.scheduleDate"
                :mensagem="mensagem"
                :formattedDate="formattedDate"
              />

              <!-- Message status -->
              <MessageStatus 
                :mensagem="mensagem"
                :formattedDate="formattedDate"
              />

              <!-- Group label -->
              <div
                v-if="isGroupLabel(mensagem)"
                class="q-mb-sm"
                style="display: flex; color: rgb(59 23 251); font-weight: 500;"
              >
                {{ isGroupLabel(mensagem) }}
              </div>

              <!-- Quoted message -->
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

              <!-- Message options -->
              <MessageOptions 
                v-if="!mensagem.isDeleted && isShowOptions"
                :mensagem="mensagem"
                :ticketFocado="ticketFocado"
                @citar-mensagem="citarMensagem"
                @encaminhar-mensagem="encaminharMensagem"
                @marcar-mensagens="marcarMensagensParaEncaminhar"
                @editar-mensagem="abrirModalEditarMensagem"
                @deletar-mensagem="deletarMensagem"
              />

              <!-- Status icon -->
              <q-icon
                v-if="mensagem.fromMe"
                class="absolute-bottom-right q-pr-xs q-pb-xs"
                :name="ackIcons[mensagem.ack]"
                size="1.2em"
                :color="mensagem.ack >= 3 ? 'blue-12' : ''"
              />

              <!-- Message content -->
              <MessageContent 
                :mensagem="mensagem"
                :url-media="urlMedia"
                :abrir-modal-imagem="abrirModalImagem"
                @update:abrir-modal-imagem="abrirModalImagem = $event"
                @update:url-media="urlMedia = $event"
                @open-contact-modal="openContactModal"
              />
            </div>
          </q-chat-message>
        </div>
      </div>
    </transition-group>

    <!-- Edit modal -->
    <MessageEditModal
      v-model="showModaledit"
      :mensagem-atual="mensagemAtual"
      @salvar="salvarMensagem"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useAtendimentoStore } from '../../stores/atendimento'
import { useMensagemChat } from '../../composables/atendimento/useMensagemChat'
import { useMessageFormat } from '../../composables/atendimento/useMessageFormat'
import MensagemRespondida from './MensagemRespondida.vue'
import MessageContent from '../../components/atendimento/MessageContent.vue'
import MessageOptions from '../../components/atendimento/MessageOptions.vue'
import MessageStatus from '../../components/atendimento/MessageStatus.vue'
import MessageScheduleIcon from '../../components/atendimento/MessageScheduleIcon.vue'
import MessageEditModal from '../../components/atendimento/MessageEditModal.vue'

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
  'mensagem-chat-encaminhar',
  'mensagem-chat-focar-input'
])

// Composables
const $q = useQuasar()
const atendimentoStore = useAtendimentoStore()
const { ticketFocado } = storeToRefs(atendimentoStore)

// Composables
const {
  mensagemAtual,
  showModaledit,
  abrirModalImagem,
  urlMedia,
  identificarMensagem,
  ackIcons,
  openContactModal,
  salvarMensagem,
  abrirModalEditarMensagem,
  verificarEncaminharMensagem,
  isGroupLabel,
  deletarMensagem,
  focarMensagem
} = useMensagemChat()

const { formattedDate } = useMessageFormat({ message: props.mensagens[0] })

// Métodos
const handleForwardCheck = msg => {
  const novasMensagens = verificarEncaminharMensagem(msg, props.mensagensParaEncaminhar)
  emit('update:mensagensParaEncaminhar', novasMensagens)
}

const citarMensagem = msg => {
  emit('update:replyingMessage', msg)
  window.$root.$emit('mensagem-chat-focar-input', msg)
}

const encaminharMensagem = msg => {
  emit('mensagem-chat-encaminhar', msg)
}

const marcarMensagensParaEncaminhar = () => {
  emit('update:mensagensParaEncaminhar', [])
  emit('update:ativarMultiEncaminhamento', !props.ativarMultiEncaminhamento)
}

const isMessageSelected = msg => props.mensagensParaEncaminhar.some(m => m.id === msg.id)

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
