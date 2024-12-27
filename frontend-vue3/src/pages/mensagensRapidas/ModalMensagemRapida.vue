<template>
  <q-dialog
    persistent
    :value="modalMensagemRapida"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      :style="$q.screen.width < 500 ? 'width: 95vw' : 'min-width: 700px; max-width: 700px'"
      class="q-pa-lg"
    >
      <div class="text-h6">{{ mensagemRapida.id ? 'Editar' : 'Criar' }} Mensagem Rápida {{ mensagemRapida.id ? `(ID: ${mensagemRapida.id})` : '' }}</div>
      <q-card-section class="q-pa-none">
        <div class="row q-my-md">
          <div class="col">
            <q-input
              style="width: 200px; margin-left: 62px"
              outlined
              rounded
              dense
              v-model="mensagemRapida.key"
              label="Chave"
            />
            <p style="margin-left: 62px; font-size: 10px; margin-top: 3px;">
              A chave é o atalho para pesquisa da mensagem pelos usuários.
            </p>
          </div>
        </div>

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

            <q-btn
              round
              flat
              class="q-ml-sm"
            >
              <q-icon
                size="2em"
                name="mdi-code-braces"
              />
              <q-tooltip>
                Variáveis
              </q-tooltip>
              <q-menu
                anchor="top right"
                self="bottom middle"
                :offset="[5, 40]"
              >
                <q-list padding>
                  <q-item
                    v-for="variavel in variaveis"
                    :key="variavel.value"
                    clickable
                    @click="inserirVariavel(variavel.value)"
                  >
                    <q-item-section>{{ variavel.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <label class="text-caption">Mensagem:</label>
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 15vh; max-height: 15vh;"
              class="q-pa-sm bg-white full-width rounded-all"
              
              placeholder="Digite a mensagem"
              autogrow
              dense
              outlined
              @input="(v) => mensagemRapida.message = v.target.value"
              :value="mensagemRapida.message"
            />
          </div>
        </div>

        <div class="row q-my-md">
          <q-uploader
            url=""
            label="Anexar Arquivos"
            @added="onFileAdded"
            :auto-upload="false"
            multiple
            accept="apk/*,image/*,video/*,audio/*,application/pdf"
          />
        </div>

        <div 
          v-if="mensagemRapida.medias && mensagemRapida.medias.length" 
          class="media-container"
        >
          <div 
            v-for="(media, index) in mensagemRapida.medias" 
            :key="index" 
            class="media-item"
          >
            <q-card 
              class="q-mb-md q-pa-none media-card"
            >
              <q-card-section>
                <img 
                  v-if="isImage(media)" 
                  :src="getMediaUrl(media)" 
                  alt="Preview" 
                  class="media-image" 
                />
                <q-icon v-else name="mdi-file-outline" class="file-icon" />
              </q-card-section>
              <q-card-actions align="center" class="q-pa-none">
                <q-btn flat @click="abrirMedia(media)">
                  <q-icon name="mdi-eye" />
                  <q-tooltip>Ver</q-tooltip>
                </q-btn>
                <q-btn flat color="negative" @click="confirmarExclusao(media, index)">
                  <q-icon name="mdi-delete" />
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-mt-md">
        <q-btn 
          rounded 
          label="Cancelar" 
          color="negative" 
          v-close-popup 
          class="q-mr-md" 
        />
        <q-btn 
          rounded 
          label="Salvar" 
          color="positive" 
          @click="handleMensagemRapida" 
        />
      </q-card-actions>
    </q-card>

    <q-dialog v-model="confirmDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmação</div>
          <p>Tem certeza de que deseja excluir esta mídia?</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Cancelar" 
            color="primary" 
            v-close-popup 
          />
          <q-btn 
            flat 
            label="Excluir" 
            color="negative" 
            @click="excluirMedia(mediaToDelete, indexToDelete)" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue'
import { CriarMensagemRapida, AlterarMensagemRapida, DeletarImagemMensagemRapida } from 'src/service/mensagensRapidas'
import { VEmojiPicker } from 'v-emoji-picker'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'ModalMensagemRapida',
  components: { VEmojiPicker },
  props: {
    modalMensagemRapida: {
      type: Boolean,
      default: false
    },
    mensagemRapidaEmEdicao: {
      type: Object,
      default: () => ({
        id: null,
        key: '',
        message: '',
        medias: []
      })
    }
  },
  emits: ['update:mensagemRapidaEmEdicao', 'update:modalMensagemRapida', 'mensagem-rapida-editada', 'mensagem-rapida-criada'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const inputEnvioMensagem = ref(null)
    const confirmDialog = ref(false)
    const loading = ref(false)
    const mediaToDelete = ref(null)
    const indexToDelete = ref(null)
    const arquivoCarregado = ref(null)

    const mensagemRapida = reactive({
      id: null,
      key: null,
      message: '',
      medias: null
    })

    const variaveis = [
      { label: 'Nome', value: '{{name}}' },
      { label: 'Saudação', value: '{{greeting}}' },
      { label: 'Protocolo', value: '{{protocol}}' }
    ]

    const onInsertSelectEmoji = emoji => {
      if (!emoji.data) return

      const tArea = inputEnvioMensagem.value
      const startPos = tArea.selectionStart
      const endPos = tArea.selectionEnd
      const cursorPos = startPos
      const tmpStr = tArea.value

      mensagemRapida.message = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)

      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    }

    const inserirVariavel = variavel => {
      mensagemRapida.message = `${mensagemRapida.message} ${variavel}`
    }

    const onFileAdded = files => {
      mensagemRapida.medias = files
      arquivoCarregado.value = files
    }

    const abrirMedia = media => {
      const url = getMediaUrl(media)
      window.open(url, '_blank')
    }

    const confirmarExclusao = (media, index) => {
      mediaToDelete.value = media
      indexToDelete.value = index
      confirmDialog.value = true
    }

    const excluirMedia = async (media, index) => {
      try {
        confirmDialog.value = false
        await DeletarImagemMensagemRapida(mensagemRapida.id, media)
        $q.notify({
          type: 'positive',
          message: 'Imagem excluída com sucesso!'
        })
        mensagemRapida.medias.splice(index, 1)
      } catch (error) {
        console.error('Erro ao excluir a imagem:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao excluir a imagem.'
        })
      }
    }

    const isImage = media => {
      if (media instanceof File) {
        return media.type.startsWith('image/')
      }
      return media.endsWith('.jpg') || media.endsWith('.jpeg') || media.endsWith('.png')
    }

    const getMediaUrl = media => {
      if (media instanceof File) {
        return URL.createObjectURL(media)
      }
      return media
    }

    const fecharModal = () => {
      emit('update:mensagemRapidaEmEdicao', { id: null })
      emit('update:modalMensagemRapida', false)
    }

    const abrirModal = () => {
      if (props.mensagemRapidaEmEdicao.id) {
        Object.assign(mensagemRapida, props.mensagemRapidaEmEdicao)
        console.log('Editando mensagem com ID:', mensagemRapida.id)
      } else {
        Object.assign(mensagemRapida, {
          key: null,
          message: '',
          medias: null
        })
      }
    }

    const handleMensagemRapida = async () => {
      const formData = new FormData()
      formData.append('key', mensagemRapida.key)
      formData.append('message', mensagemRapida.message)

      if (mensagemRapida.medias) {
        mensagemRapida.medias.forEach(file => {
          formData.append('medias', file instanceof File ? file : file)
        })
      }

      loading.value = true
      console.log('Mensagem ID:', mensagemRapida.id)

      try {
        if (mensagemRapida.id) {
          const { data } = await AlterarMensagemRapida(mensagemRapida.id, formData)
          emit('mensagem-rapida-editada', { ...mensagemRapida, ...data })
          $q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Mensagem Rápida editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarMensagemRapida(formData)
          emit('mensagem-rapida-criada', data)
          $q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Mensagem rápida criada!',
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
          message: 'Erro ao salvar a mensagem.'
        })
      }
      loading.value = false
    }

    return {
      inputEnvioMensagem,
      mensagemRapida,
      confirmDialog,
      loading,
      mediaToDelete,
      indexToDelete,
      arquivoCarregado,
      variaveis,
      onInsertSelectEmoji,
      inserirVariavel,
      onFileAdded,
      abrirMedia,
      confirmarExclusao,
      excluirMedia,
      isImage,
      getMediaUrl,
      fecharModal,
      abrirModal,
      handleMensagemRapida
    }
  }
})
</script>

<style scoped>
.q-uploader {
  width: 100%;
  margin-top: 20px;
}

.media-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.media-item {
  margin-right: 10px;
  margin-bottom: 10px;
}

.media-card {
  width: 150px;
  height: 150px;
  border-radius: 10px;
  border: 1px solid #ccc;
}

.media-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
}

.file-icon {
  font-size: 48px;
  text-align: center;
  margin-top: 30px;
}

.q-btn {
  margin-right: 10px;
}
</style>
