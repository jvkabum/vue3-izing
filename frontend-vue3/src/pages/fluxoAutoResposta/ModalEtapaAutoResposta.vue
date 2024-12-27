<template>
  <q-dialog
    persistent
    :modelValue="modalEtapaAutoResposta"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 600px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-caption">
          Auto Resposta: {{ autoReply.name }}
        </div>
        <div class="text-h6">{{ etapaAutoRespostaEdicao.id ? 'Editar': 'Criar' }} Etapa {{ etapaAutoRespostaEdicao.id  ? `(ID: ${etapaAutoRespostaEdicao.id})` : '' }}</div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <div class="row items-center">
          <div class="col-xs-3 col-sm-2 col-md-1">
            <q-btn
              round
              flat
              class="q-ml-sm"
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
            <label class="text-caption">Mensagem da Etapa:</label>
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 15vh; max-height: 15vh;"
              class="q-pa-sm bg-white full-width"
              placeholder="Digita sua mensagem"
              autogrow
              dense
              outlined
              @input="(v) => etapa.reply = v.target.value"
              :value="etapa.reply"
            />
          </div>
        </div>
        <div class="row col q-mt-md">
          <q-checkbox
            v-model="etapa.initialStep"
            label="Etapa inicial"
          />
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
          @click="handleEtapaAutoresposta"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { VEmojiPicker } from 'v-emoji-picker'
import { CriarEtapaResposta, EditarEtapaResposta } from 'src/service/autoResposta'

export default defineComponent({
  name: 'ModalEtapaAutoResposta',
  components: { VEmojiPicker },
  props: {
    modalEtapaAutoResposta: {
      type: Boolean,
      default: false
    },
    autoReply: {
      type: Object,
      default: () => ({ id: null, name: '' })
    },
    etapaAutoRespostaEdicao: {
      type: Object,
      default: () => ({ id: null })
    }
  },
  emits: ['update:modalEtapaAutoResposta', 'update:etapaAutoRespostaEdicao', 'etapa-auto-resposta-editada', 'etapa-auto-resposta-criada'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const loading = ref(false)
    const inputEnvioMensagem = ref(null)
    const txtContent = ref('')

    const etapa = reactive({
      reply: null,
      idAutoReply: null,
      action: null,
      initialStep: false
    })

    const onInsertSelectEmoji = emoji => {
      if (!emoji.data) return

      const tArea = inputEnvioMensagem.value
      const startPos = tArea.selectionStart
      const endPos = tArea.selectionEnd
      const tmpStr = tArea.value

      txtContent.value = etapa.reply
      txtContent.value = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      etapa.reply = txtContent.value

      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = startPos + emoji.data.length
      }, 10)
    }

    const fecharModal = () => {
      emit('update:etapaAutoRespostaEdicao', { id: null })
      emit('update:modalEtapaAutoResposta', false)
    }

    const abrirModal = () => {
      if (props.etapaAutoRespostaEdicao.id) {
        Object.assign(etapa, props.etapaAutoRespostaEdicao)
      } else {
        Object.assign(etapa, {
          reply: null,
          idAutoReply: null,
          initialStep: false
        })
        etapa.idAutoReply = props.autoReply.id
      }
    }

    const verificarEtapaInicial = dataParams => {
      const isInitialExists = props.autoReply.stepsReply 
        ? props.autoReply.stepsReply.find(s => s.initialStep && s.id !== dataParams.id) 
        : {}

      if (isInitialExists && dataParams.initialStep) {
        $q.notify({
          type: 'negative',
          progress: true,
          timeout: 100000,
          position: 'top',
          closeBtn: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }],
          message: `Cada Auto Resposta poderá ter apenas uma etapa inicial. A etapa de "ID: ${isInitialExists.id}" está indicada como a etapa inicial. Caso deseje alterar, precisa primerio editar a etapa ("ID: ${isInitialExists.id}") para que não seja a etapa inicial.`
        })
        throw new Error('Etapa Inicial na Auto Resposta já existente')
      }
    }

    const handleEtapaAutoresposta = async () => {
      loading.value = true
      const dataParams = {
        ...etapa,
        idAutoReply: props.autoReply.id
      }

      try {
        verificarEtapaInicial(dataParams)

        if (etapa.id) {
          const { data } = await EditarEtapaResposta(dataParams)
          emit('etapa-auto-resposta-editada', { ...dataParams, ...data })
          $q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Etapa editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarEtapaResposta(dataParams)
          emit('etapa-auto-resposta-criada', data)
          $q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Etapa criada!',
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
        if (error.message !== 'Etapa Inicial na Auto Resposta já existente') {
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
      } finally {
        loading.value = false
      }
    }

    return {
      etapa,
      loading,
      inputEnvioMensagem,
      onInsertSelectEmoji,
      fecharModal,
      abrirModal,
      handleEtapaAutoresposta
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
