<template>
  <div>
    <template v-if="ticketFocado.status != 'pending'">
      <div class="row absolute-full fit col-12" ref="menuFast">
        <q-menu
          :target="$refs.menuFast"
          :key="filteredMensagensRapidas.length"
          square
          no-focus
          no-parent-event
          class="no-box-shadow no-shadow"
          fit
          :offset="[0, 5]"
          persistent
          max-height="400px"
          @hide="visualizarMensagensRapidas = false"
          :model-value="textChat.startsWith('/') || visualizarMensagensRapidas"
        >
          <q-list
            class="no-shadow no-box-shadow"
            style="min-width: 100px"
            separator
            v-if="!filteredMensagensRapidas.length"
          >
            <q-item>
              <q-item-section>
                <q-item-label class="text-negative text-bold">Ops... Nada por aqui!</q-item-label>
                <q-item-label caption>Cadastre suas mensagens na administração de sistema.</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-list
            class="no-shadow no-box-shadow"
            style="min-width: 100px"
            separator
            v-else
          >
            <q-item
              v-for="resposta in filteredMensagensRapidas"
              :key="resposta.key"
              clickable
              v-close-popup
              @click="mensagemRapidaSelecionada(resposta)"
            >
              <q-item-section>
                <q-item-label class="text-bold">{{ resposta.key }}</q-item-label>
                <q-item-label caption lines="2">{{ resposta.message }}</q-item-label>
              </q-item-section>
              <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
                {{ resposta.message }}
              </q-tooltip>
            </q-item>
          </q-list>
        </q-menu>
      </div>

      <div style="min-height: 80px" class="row q-pb-md q-pt-sm bg-white justify-start items-center text-grey-9 relative-position">
        <div class="row col-12 q-pa-sm" v-if="isScheduleDate">
          <q-datetime-picker
            style="width: 300px"
            dense
            rounded
            hide-bottom-space
            outlined
            stack-label
            bottom-slots
            label="Data/Hora Agendamento"
            mode="datetime"
            color="primary"
            v-model="scheduleDate"
            format24h
          />
        </div>

        <template v-if="!isRecordingAudio">
          <q-btn
            v-if="$q.screen.width > 500"
            flat
            dense
            @click="abrirEnvioArquivo"
            icon="mdi-paperclip"
            :disable="disableActions"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold">Enviar arquivo</q-tooltip>
          </q-btn>

          <q-btn
            v-if="$q.screen.width > 500"
            flat
            dense
            icon="mdi-emoticon-happy-outline"
            :disable="disableActions"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold">Emoji</q-tooltip>
            <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
              <VEmojiPicker
                style="width: 40vw"
                :showSearch="false"
                :emojisByRow="20"
                labelSearch="Localizar..."
                lang="pt-BR"
                @select="onInsertSelectEmoji"
              />
            </q-menu>
          </q-btn>

          <q-toggle
            keep-color
            v-model="sign"
            dense
            @update:model-value="handleSign"
            class="q-mx-sm q-ml-md"
            :color="sign ? 'positive' : 'black'"
            type="toggle"
          >
            <q-tooltip>{{ sign ? 'Desativar' : 'Ativar' }} Assinatura</q-tooltip>
          </q-toggle>

          <q-input
            hide-bottom-space
            :loading="loading"
            :disable="disableActions"
            ref="inputEnvioMensagem"
            id="inputEnvioMensagem"
            type="textarea"
            @keydown.exact.enter.prevent="() => textChat.trim().length ? enviarMensagem() : ''"
            v-show="!mostrarEnvioArquivo"
            class="col-grow q-mx-xs text-grey-10 inputEnvioMensagem"
            bg-color="grey-2"
            color="grey-7"
            placeholder="Digita sua mensagem"
            input-style="max-height: 30vh"
            autogrow
            rounded
            dense
            outlined
            v-model="textChat"
            @paste="handleInputPaste"
          >
            <template v-slot:append>
              <q-btn
                dense
                flat
                round
                icon="mdi-message-flash-outline"
                @click="visualizarMensagensRapidas = !visualizarMensagensRapidas"
              >
                <q-tooltip content-class="text-bold">Mensagens Rápidas</q-tooltip>
              </q-btn>
            </template>
          </q-input>

          <q-file
            :loading="loading"
            :disable="disableActions"
            ref="PickerFileMessage"
            id="PickerFileMessage"
            v-show="mostrarEnvioArquivo"
            v-model="arquivos"
            class="col-grow q-mx-xs PickerFileMessage"
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            use-chips
            multiple
            autogrow
            dense
            rounded
            append
            :max-files="5"
            :max-file-size="15485760"
            :max-total-size="15485760"
            accept=".txt, .xml, .jpg, .png, image/jpeg, .pdf, .doc, .docx, .mp4, .ogg, .mp3, .xls, .xlsx, .jpeg, .rar, .zip, .ppt, .pptx, image/*"
            @rejected="onRejectedFiles"
          />

          <q-btn
            v-if="textChat || mostrarEnvioArquivo"
            ref="btnEnviarMensagem"
            @click="enviarMensagem"
            :disabled="ticketFocado.status !== 'open'"
            flat
            icon="mdi-send"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold">Enviar Mensagem</q-tooltip>
          </q-btn>

          <q-btn
            v-if="!textChat && !mostrarEnvioArquivo && !isRecordingAudio"
            @click="handleSartRecordingAudio"
            :disabled="disableActions"
            flat
            icon="mdi-microphone"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold">Enviar Áudio</q-tooltip>
          </q-btn>
        </template>

        <template v-else>
          <div class="full-width items-center row justify-end">
            <q-skeleton animation="pulse-y" class="col-grow q-mx-md" type="text" />
            <div style="width: 200px" class="flex flex-center items-center" v-if="isRecordingAudio">
              <q-btn
                flat
                icon="mdi-close"
                color="negative"
                @click="handleCancelRecordingAudio"
                class="bg-padrao btn-rounded q-mx-xs"
              />
              <RecordingTimer class="text-bold" :class="{ 'text-white': $q.dark.isActive }" />
              <q-btn
                flat
                icon="mdi-send-circle-outline"
                color="positive"
                @click="handleStopRecordingAudio"
                class="bg-padrao btn-rounded q-mx-xs"
              />
            </div>
          </div>
        </template>
      </div>
    </template>

    <template v-else>
      <div style="min-height: 80px" class="row q-pb-md q-pt-sm bg-white justify-center items-center text-grey-9 relative-position">
        <q-btn
          push
          rounded
          style="width: 250px"
          class="text-bold"
          color="positive"
          icon="mdi-send-circle"
          label="Iniciar o atendimento"
          @click="iniciarAtendimento(ticketFocado)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { VEmojiPicker } from 'v-emoji-picker'
import { useMessageInput } from 'src/composables/atendimento/useMessageInput'
import { useTicketStatus } from 'src/composables/useTicketStatus'
import { useAudioRecording } from 'src/composables/atendimento/useAudioRecording'
import RecordingTimer from './RecordingTimer.vue'

const props = defineProps({
  replyingMessage: {
    type: Object,
    default: null
  },
  isScheduleDate: {
    type: Boolean,
    default: false
  },
  mensagensRapidas: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:replyingMessage'])

const $q = useQuasar()

const {
  loading,
  messageText: textChat,
  attachments: arquivos,
  showEmojiPicker: visualizarMensagensRapidas,
  sign,
  ticketFocado,
  canSendMessage,
  handleInputPaste,
  addEmoji: onInsertSelectEmoji,
  sendMessage: enviarMensagem,
  handleSign
} = useMessageInput()

const {
  isRecording: isRecordingAudio,
  startRecording: handleSartRecordingAudio,
  stopRecording: handleStopRecordingAudio,
  cancelRecording: handleCancelRecordingAudio
} = useAudioRecording()

const { iniciarAtendimento } = useTicketStatus()

const inputEnvioMensagem = ref(null)

const mostrarEnvioArquivo = computed(() => arquivos.value.length > 0)
const disableActions = computed(() => isRecordingAudio.value || ticketFocado.value.status !== 'open')
const filteredMensagensRapidas = computed(() => {
  let search = textChat.value?.toLowerCase()
  if (search && search.trim().startsWith('/')) {
    search = search.replace('/', '')
  }
  return !search ? props.mensagensRapidas : props.mensagensRapidas.filter(r => r.key.toLowerCase().includes(search))
})

const abrirEnvioArquivo = (event) => {
  textChat.value = ''
  abrirFilePicker.value = true
  inputEnvioMensagem.value.pickFiles(event)
}

const onInsertSelectEmoji = (emoji) => {
  if (!emoji.data) return
  
  const tArea = inputEnvioMensagem.value.$refs.input
  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const tmpStr = tArea.value
  
  textChat.value = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
  
  setTimeout(() => {
    tArea.selectionStart = tArea.selectionEnd = startPos + emoji.data.length
  }, 10)
}

const enviarMensagem = async () => {
  if (props.isScheduleDate && !scheduleDate.value) {
    $q.notify({
      type: 'negative',
      message: 'Para agendar uma mensagem, informe o campo Data/Hora Agendamento.'
    })
    return
  }

  loading.value = true
  const ticketId = ticketFocado.value.id

  try {
    const message = !mostrarEnvioArquivo.value
      ? prepararMensagemTexto(props.mensagensRapidas, props.replyingMessage, props.isScheduleDate)
      : prepararUploadMedia(props.isScheduleDate)

    if (!mostrarEnvioArquivo.value && !textChat.value) return

    await EnviarMensagemTexto(ticketId, message)
    
    arquivos.value = []
    textChat.value = ''
    emit('update:replyingMessage', null)
    abrirFilePicker.value = false
    abrirModalPreviewImagem.value = false

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('scrollToBottomMessageChat'))
    }, 300)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Ocorreu um erro!',
      caption: error.message
    })
  } finally {
    loading.value = false
    setTimeout(() => {
      inputEnvioMensagem.value?.focus()
    }, 300)
  }
}

const onRejectedFiles = () => {
  $q.notify({
    html: true,
    message: `Ops... Ocorreu um erro! <br>
    <ul>
      <li>Cada arquivo deve ter no máximo 10MB.</li>
      <li>Em caso de múltiplos arquivos, o tamanho total (soma de todos) deve ser de até 30MB.</li>
    </ul>`,
    type: 'negative',
    progress: true,
    position: 'top',
    actions: [{
      icon: 'close',
      round: true,
      color: 'white'
    }]
  })
}

onMounted(() => {
  window.addEventListener('mensagem-chat:focar-input-mensagem', () => inputEnvioMensagem.value?.focus())
  window.addEventListener('paste', handleInputPaste)
})

onBeforeUnmount(() => {
  window.removeEventListener('mensagem-chat:focar-input-mensagem', () => inputEnvioMensagem.value?.focus())
  window.removeEventListener('paste', handleInputPaste)
})
</script>

<style lang="sass" scoped>
@media (max-width: 850px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 150px

@media (min-width: 851px), (max-width: 1360px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 200px !important
</style>
