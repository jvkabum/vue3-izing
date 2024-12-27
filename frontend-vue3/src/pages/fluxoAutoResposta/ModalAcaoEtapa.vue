<template>
  <q-dialog
    :modelValue="modalAcaoEtapa"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
    position="top"
  >
    <q-card
      style="width: 600px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ acaoEtapaEdicao.id ? 'Editar': 'Criar' }} Ação Etapa</div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col">
            <q-input
              dense
              square
              outlined
              v-model="acaoEtapa.words"
              label="Chave"
            />
          </div>
        </div>
        <div class="row q-mt-md">
          <div class="col">
            <q-option-group
              inline
              v-model="acaoEtapa.action"
              :options="optionsAcao"
              color="primary"
            />
          </div>
        </div>
        <div class="row q-mt-md">
          <div class="col">
            <q-select
              v-if="acaoEtapa.action === 0"
              dense
              outlined
              class="full-width"
              v-model="acaoEtapa.nextStepId"
              :options="autoReply.stepsReply"
              option-label="id"
              option-value="id"
              label="Etapa"
              map-options
              emit-value
              clearable
              @update:model-value="onNextStepChange"
            />
            <q-select
              v-if="acaoEtapa.action === 1"
              dense
              outlined
              class="full-width"
              v-model="acaoEtapa.queueId"
              :options="filas"
              option-label="queue"
              option-value="id"
              label="Fila"
              map-options
              emit-value
              clearable
              @update:model-value="onQueueChange"
            />
            <q-select
              v-if="acaoEtapa.action === 2"
              dense
              outlined
              class="full-width"
              v-model="acaoEtapa.userIdDestination"
              :options="usuarios"
              option-label="name"
              option-value="id"
              label="Usuário"
              map-options
              emit-value
              clearable
              @update:model-value="onUserChange"
            />
          </div>
        </div>
        <div class="row items-center q-mt-md">
          <div class="col-xs-3 col-sm-2 col-md-1">
            <q-btn
              round
              flat
            >
              <q-icon
                size="2em"
                name="mdi-emoticon-happy-outline"
              />
              <q-tooltip>
                Emoji
              </q-tooltip>
              <q-menu
                anchor="top right"
                self="bottom middle"
                :offset="[5, 40]"
              >
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
          </div>
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <label class="text-caption">Mensagem retorno:</label>
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 10vh; max-height: 10vh;"
              class="q-pa-sm bg-white full-width"
              placeholder="Digita a mensagem"
              autogrow
              dense
              outlined
              @input="(v) => acaoEtapa.replyDefinition = v.target.value"
              :value="acaoEtapa.replyDefinition"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          label="Salvar"
          color="primary"
          @click="handleAcaoEtapa"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { CriarAcaoEtapa, EditarAcaoEtapa } from 'src/service/autoResposta'
import { VEmojiPicker } from 'v-emoji-picker'

const userId = +localStorage.getItem('userId')

export default defineComponent({
  name: 'ModalAcaoEtapa',
  components: { VEmojiPicker },
  props: {
    modalAcaoEtapa: {
      type: Boolean,
      default: false
    },
    acaoEtapaEdicao: {
      type: Object,
      default: () => ({ id: null })
    },
    etapaAutoResposta: {
      type: Object,
      default: () => ({ id: null })
    },
    filas: {
      type: Array,
      default: () => []
    },
    usuarios: {
      type: Array,
      default: () => []
    },
    autoReply: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modalAcaoEtapa', 'update:acaoEtapaEdicao', 'acao-etapa-editada', 'acao-etapa-criada'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const inputEnvioMensagem = ref(null)
    const txtContent = ref('')

    const optionsAcao = [
      { value: 0, label: 'Proxima Etapa' },
      { value: 1, label: 'Enviar para Fila' },
      { value: 2, label: 'Enviar para usuário' }
    ]

    const acaoEtapa = reactive({
      stepReplyId: null,
      words: null,
      action: null,
      userId,
      queueId: null,
      userIdDestination: null,
      nextStepId: null,
      replyDefinition: null
    })

    const resetAcaoEtapa = () => {
      Object.assign(acaoEtapa, {
        stepReplyId: null,
        words: null,
        action: null,
        userId,
        queueId: null,
        userIdDestination: null,
        nextStepId: null,
        replyDefinition: null
      })
    }

    const abrirModal = () => {
      if (props.acaoEtapaEdicao.id) {
        Object.assign(acaoEtapa, {
          ...props.acaoEtapaEdicao,
          userId
        })
      } else {
        resetAcaoEtapa()
      }
    }

    const fecharModal = () => {
      resetAcaoEtapa()
      emit('update:acaoEtapaEdicao', { id: null })
      emit('update:modalAcaoEtapa', false)
    }

    const onNextStepChange = () => {
      acaoEtapa.queueId = null
      acaoEtapa.userIdDestination = null
    }

    const onQueueChange = () => {
      acaoEtapa.nextStepId = null
      acaoEtapa.userIdDestination = null
    }

    const onUserChange = () => {
      acaoEtapa.nextStepId = null
      acaoEtapa.queueId = null
    }

    const handleAcaoEtapa = async () => {
      const params = {
        ...acaoEtapa,
        stepReplyId: props.etapaAutoResposta.id
      }
      try {
        if (params.id) {
          const { data } = await EditarAcaoEtapa(params)
          emit('acao-etapa-editada', data)
          $q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Ação editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarAcaoEtapa(params)
          emit('acao-etapa-criada', data)
          $q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Ação criada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        fecharModal()
      } catch (error) {
        console.error(error)
        $q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          message: 'Ocorreu um erro!',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
    }

    const onInsertSelectEmoji = emoji => {
      if (!emoji.data) return

      const tArea = inputEnvioMensagem.value
      const startPos = tArea.selectionStart
      const endPos = tArea.selectionEnd
      const tmpStr = tArea.value

      txtContent.value = acaoEtapa.replyDefinition
      txtContent.value = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      acaoEtapa.replyDefinition = txtContent.value

      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = startPos + emoji.data.length
      }, 10)
    }

    return {
      acaoEtapa,
      optionsAcao,
      inputEnvioMensagem,
      fecharModal,
      abrirModal,
      handleAcaoEtapa,
      onInsertSelectEmoji,
      onNextStepChange,
      onQueueChange,
      onUserChange
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
