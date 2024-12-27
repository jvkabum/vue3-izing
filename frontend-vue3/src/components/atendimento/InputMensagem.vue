<template>
  <div class="q-pa-md">
    <div v-if="replyingMessage.id" class="q-mb-sm">
      <MensagemRespondida
        :mensagem="replyingMessage"
        @mensagem-respondida:focar-mensagem="focarMensagem"
      />
      <q-btn
        dense
        flat
        round
        icon="close"
        class="absolute-top-right"
        @click="$emit('update:replyingMessage', {})"
      />
    </div>

    <div class="row items-center">
      <q-input
        v-model="textChat"
        dense
        outlined
        class="col"
        placeholder="Digite uma mensagem"
        @keydown.enter.prevent="handleEnviarMensagem"
        @paste="handleInputPaste"
      >
        <template #before>
          <q-btn
            dense
            flat
            round
            icon="attach_file"
            @click="abrirFilePicker = true"
          >
            <q-tooltip>Anexar arquivo</q-tooltip>
          </q-btn>
          <q-btn
            dense
            flat
            round
            icon="mdi-message-fast-outline"
            @click="visualizarMensagensRapidas = true"
          >
            <q-tooltip>Mensagens rápidas</q-tooltip>
          </q-btn>
        </template>

        <template #append>
          <q-btn
            v-if="!isRecordingAudio"
            dense
            flat
            round
            icon="mic"
            @click="handleSartRecordingAudio"
          >
            <q-tooltip>Gravar áudio</q-tooltip>
          </q-btn>
          <q-btn
            v-else
            dense
            flat
            round
            icon="stop"
            @click="handleStopRecordingAudio"
          >
            <q-tooltip>Parar gravação</q-tooltip>
          </q-btn>
          <q-btn
            dense
            flat
            round
            icon="send"
            @click="handleEnviarMensagem"
            :disable="!textChat.trim() && !arquivos.length"
          >
            <q-tooltip>Enviar mensagem</q-tooltip>
          </q-btn>
        </template>
      </q-input>
    </div>

    <q-dialog v-model="abrirFilePicker">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Selecionar arquivo</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-file
            v-model="arquivos"
            label="Selecione um arquivo"
            filled
            multiple
            @update:model-value="handleFileSelected"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn flat label="Enviar" color="primary" @click="handleEnviarArquivo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="visualizarMensagensRapidas">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Mensagens Rápidas</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list>
            <q-item
              v-for="mensagem in mensagensRapidas"
              :key="mensagem.id"
              clickable
              v-ripple
              @click="handleMensagemRapidaSelecionada(mensagem)"
            >
              <q-item-section>
                <q-item-label>{{ mensagem.key }}</q-item-label>
                <q-item-label caption>{{ mensagem.message }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="abrirModalImagem">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ urlMediaPreview.title }}</div>
        </q-card-section>

        <q-card-section>
          <q-img :src="urlMediaPreview.src" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn flat label="Enviar" color="primary" @click="handleEnviarArquivo" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useStore } from 'src/stores'
import { useMensagem } from 'src/composables/atendimento/useMensagem'
import MensagemRespondida from './MensagemRespondida.vue'

const props = defineProps({
  replyingMessage: {
    type: Object,
    default: () => ({})
  },
  mensagensRapidas: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:replyingMessage'])

const $q = useQuasar()
const store = useStore()
const { ticketFocado } = storeToRefs(store)

const {
  loading,
  abrirFilePicker,
  abrirModalImagem,
  isRecordingAudio,
  urlMediaPreview,
  visualizarMensagensRapidas,
  arquivos,
  textChat,
  sign,
  scheduleDate,
  handleInputPaste,
  mensagemRapidaSelecionada,
  handleSartRecordingAudio,
  handleStopRecordingAudio,
  handleCancelRecordingAudio,
  prepararUploadMedia,
  prepararMensagemTexto,
  handleSign
} = useMensagem()

const handleEnviarMensagem = async () => {
  if (!ticketFocado.value?.id) return

  try {
    if (arquivos.value.length) {
      const formData = prepararUploadMedia(false)
      await store.dispatch('EnviarMensagem', {
        ticketId: ticketFocado.value.id,
        message: formData
      })
      arquivos.value = []
      abrirFilePicker.value = false
      abrirModalImagem.value = false
    } else {
      const message = prepararMensagemTexto(props.mensagensRapidas, props.replyingMessage, false)
      await store.dispatch('EnviarMensagem', {
        ticketId: ticketFocado.value.id,
        message
      })
      textChat.value = ''
      emit('update:replyingMessage', {})
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  }
}

const handleFileSelected = () => {
  if (arquivos.value.length > 10) {
    $q.notify({
      type: 'negative',
      message: 'Máximo de 10 arquivos permitidos'
    })
    arquivos.value = []
    return
  }
}

const handleEnviarArquivo = () => {
  handleEnviarMensagem()
}

const handleMensagemRapidaSelecionada = (mensagem) => {
  mensagemRapidaSelecionada(mensagem)
  visualizarMensagensRapidas.value = false
}
</script>

<style lang="scss" scoped>
.q-message-container {
  max-width: 100%;
  word-break: break-word;
}
</style>
