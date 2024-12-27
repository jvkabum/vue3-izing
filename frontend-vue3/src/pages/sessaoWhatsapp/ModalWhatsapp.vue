<template>
  <q-dialog
    :value="modalWhatsapp"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  >
    <q-card
      class="q-pa-md"
      style="width: 500px"
    >
      <q-card-section>
        <div class="text-h6">
          <q-icon
            size="50px"
            class="q-mr-md"
            :name="whatsapp.type ? `img:${whatsapp.type}-logo.png` : 'mdi-alert'"
          /> {{ whatsapp.id ? 'Editar' : 'Adicionar' }}
          Canal
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 q-my-sm">
            <q-select
              :disable="!!whatsapp.id"
              v-model="whatsapp.type"
              :options="optionsWhatsappsTypes"
              label="Tipo"
              emit-value
              map-options
              outlined
              rounded
              dense
            />
          </div>
          <div class="col-12">
            <c-input
              outlined
              rounded
              label="Nome"
              dense
              v-model="whatsapp.name"
              :validator="v$.whatsapp.name"
              @blur="v$.whatsapp.name.$touch"
            />
          </div>

          <div
            class="col-12 q-mt-md"
            v-if="whatsapp.type === 'telegram'"
          >
            <c-input
              outlined
              dense
              label="Token Telegram"
              v-model="whatsapp.tokenTelegram"
            />
          </div>
          <div
            class="q-mt-md row full-width justify-center"
            v-if="whatsapp.type === 'instagram'"
          >
            <div class="col">
              <fieldset class="full-width q-pa-md rounded-all">
                <legend>Dados da conta do Instagram</legend>
                <div
                  class="col-12 q-mb-md"
                  v-if="whatsapp.type === 'instagram'"
                >
                  <c-input
                    outlined
                    dense
                    label="Usuário"
                    v-model="whatsapp.instagramUser"
                    hint="Seu usuário do Instagram (sem @)"
                  />
                </div>
                <div
                  v-if="whatsapp.type === 'instagram' && !isEdit"
                  class="text-center"
                >
                  <q-btn
                    color="positive"
                    icon="edit"
                    label="Nova senha"
                    @click="isEdit = !isEdit"
                  >
                    <q-tooltip>
                      Alterar senha
                    </q-tooltip>
                  </q-btn>
                </div>
                <div
                  class="col-12"
                  v-if="whatsapp.type === 'instagram' && isEdit"
                >
                  <c-input
                    outlined
                    rounded
                    label="Senha"
                    :type="isPwd ? 'password' : 'text'"
                    v-model="whatsapp.instagramKey"
                    hint="Senha utilizada para logar no Instagram"
                    placeholder="*************"
                    :disable="!isEdit"
                  >
                    <template v-slot:after>
                      <q-btn
                        class="bg-padrao"
                        round
                        flat
                        color="negative"
                        icon="mdi-close"
                        @click="isEdit = !isEdit"
                      >
                        <q-tooltip>
                          Cancelar alteração de senha
                        </q-tooltip>
                      </q-btn>
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </c-input>
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        <div class="row q-my-md">
          <div class="col-12 relative-position">
            <label class="text-caption">Mensagem Despedida:
            </label>
            <textarea
              ref="inputFarewellMessage"
              style="min-height: 15vh; max-height: 15vh;"
              class="q-pa-sm rounded-all bg-white full-width"
              placeholder="Digite a mensagem"
              autogrow
              dense
              outlined
              v-model="whatsapp.farewellMessage"
            >
            </textarea>
            <div class="absolute-top-right">
              <q-btn
                rounded
                dense
                color="black"
                style="margin-bottom: -120px; margin-right: -30px"
              >
                <q-icon
                  size="1.5em"
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
                rounded
                dense
                color="black"
                style="margin-bottom: -40px; margin-right: -10px"
              >
                <q-icon
                  size="1.5em"
                  name="mdi-variable"
                />
                <q-tooltip>
                  Variáveis
                </q-tooltip>
                <q-menu touch-position>
                  <q-list
                    dense
                    style="min-width: 100px"
                  >
                    <q-item
                      v-for="variavel in variaveis"
                      :key="variavel.label"
                      clickable
                      @click="onInsertSelectVariable(variavel.value)"
                      v-close-popup
                    >
                      <q-item-section>{{ variavel.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions
        align="center"
        class="q-mt-lg"
      >
        <q-btn
          rounded
          label="Sair"
          class="q-px-md q-mr-lg"
          color="negative"
          v-close-popup
        />
        <q-btn
          label="Salvar"
          color="positive"
          rounded
          class="q-px-md"
          @click="handleSaveWhatsApp(whatsapp)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'
import { UpdateWhatsapp, CriarWhatsapp } from 'src/service/sessoesWhatsapp'
import cInput from 'src/components/cInput.vue'
import { copyToClipboard, Notify } from 'quasar'
import { VEmojiPicker } from 'v-emoji-picker'

const props = defineProps({
  modalWhatsapp: {
    type: Boolean,
    default: false
  },
  whatsAppId: {
    type: Number,
    default: null
  },
  whatsAppEdit: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:whatsAppEdit', 'update:modalWhatsapp', 'recarregar-lista'])

const isPwd = ref(true)
const isEdit = ref(false)
const inputFarewellMessage = ref(null)
const txtContent = ref('')

const whatsapp = reactive({
  name: '',
  isDefault: false,
  tokenTelegram: '',
  instagramUser: '',
  instagramKey: '',
  tokenAPI: '',
  type: 'whatsapp',
  farewellMessage: ''
})

const rules = {
  whatsapp: {
    name: { required, minLength: minLength(3), maxLength: maxLength(50) },
    isDefault: {}
  }
}

const v$ = useVuelidate(rules, { whatsapp })

const optionsWhatsappsTypes = [
  { label: 'Whatsapp', value: 'whatsapp' },
  { label: 'Telegram', value: 'telegram' }
]

const variaveis = [
  { label: 'Nome', value: '{{name}}' },
  { label: 'Saudação', value: '{{greeting}}' },
  { label: 'Protocolo', value: '{{protocol}}' }
]

const onInsertSelectEmoji = (emoji) => {
  if (!emoji.data) return
  
  const tArea = inputFarewellMessage.value
  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const tmpStr = tArea.value

  txtContent.value = whatsapp.farewellMessage
  txtContent.value = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
  whatsapp.farewellMessage = txtContent.value

  setTimeout(() => {
    tArea.selectionStart = tArea.selectionEnd = startPos + emoji.data.length
  }, 10)
}

const onInsertSelectVariable = (variable) => {
  if (!variable) return
  
  const tArea = inputFarewellMessage.value
  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const tmpStr = tArea.value

  txtContent.value = whatsapp.farewellMessage
  txtContent.value = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
  whatsapp.farewellMessage = txtContent.value

  setTimeout(() => {
    tArea.selectionStart = tArea.selectionEnd = startPos + 1
  }, 10)
}

const copy = (text) => {
  copyToClipboard(text)
    .then(() => Notify.create({
      type: 'positive',
      message: 'URL de integração copiada!'
    }))
    .catch(console.error)
}

const fecharModal = () => {
  Object.assign(whatsapp, {
    name: '',
    isDefault: false
  })
  emit('update:whatsAppEdit', {})
  emit('update:modalWhatsapp', false)
}

const abrirModal = () => {
  if (props.whatsAppEdit.id) {
    Object.assign(whatsapp, props.whatsAppEdit)
  }
}

const handleSaveWhatsApp = async () => {
  v$.value.$touch()
  if (v$.value.$error) {
    return Notify.create({
      type: 'warning',
      progress: true,
      position: 'top',
      message: 'Ops! Verifique os erros...',
      actions: [{
        icon: 'close',
        round: true,
        color: 'white'
      }]
    })
  }

  try {
    if (props.whatsAppEdit.id) {
      await UpdateWhatsapp(props.whatsAppEdit.id, whatsapp)
    } else {
      await CriarWhatsapp(whatsapp)
    }

    Notify.create({
      type: 'positive',
      progress: true,
      position: 'top',
      message: `Whatsapp ${props.whatsAppEdit.id ? 'editado' : 'criado'} com sucesso!`,
      actions: [{
        icon: 'close',
        round: true,
        color: 'white'
      }]
    })

    emit('recarregar-lista')
    fecharModal()
  } catch (error) {
    if (error.data?.error === 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT') {
      Notify.create({
        type: 'negative',
        message: 'Limite de conexões atingida.',
        caption: 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT',
        position: 'top',
        progress: true
      })
    } else {
      console.error(error)
      Notify.create({
        type: 'negative',
        progress: true,
        position: 'top',
        message: 'Ops! Verifique os erros... O nome da conexão não pode existir na plataforma, é um identificador único.',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
    }
  }
}

onUnmounted(() => {
  v$.value.$reset()
})
</script>

<style lang="scss" scoped>
</style>
