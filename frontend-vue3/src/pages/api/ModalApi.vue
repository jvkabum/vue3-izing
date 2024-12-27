<template>
  <q-dialog
    persistent
    :model-value="modalApi"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="min-width: 80vw; width: 80vw"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ apiEdicao.id ? 'Editar' : 'Criar' }} Configuração API</div>
      </q-card-section>
      <q-card-section>
        <fieldset class="q-pa-md full-width rounded-all">
          <legend class="q-px-sm">Dados API</legend>
          <div class="row q-col-gutter-md">
            <div class="col-xs-12 col-sm-6">
              <q-input
                rounded
                dense
                outlined
                v-model="api.name"
                label="Nome da API"
                @blur="v$.api.name.$touch"
                :error="v$.api.name.$error"
                error-message="Nome é obrigatório"
              />
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-select
                rounded
                dense
                outlined
                emit-value
                map-options
                label="Enviar por"
                color="primary"
                v-model="api.sessionId"
                :options="cSessions"
                :input-debounce="700"
                option-value="id"
                option-label="name"
                @blur="v$.api.sessionId.$touch"
                :error="v$.api.sessionId.$error"
                input-style="width: 280px; max-width: 280px;"
                error-message="Sessão é obrigatória"
              />
            </div>
          </div>
        </fieldset>
        <fieldset class="q-pa-md full-width q-mt-lg rounded-all">
          <legend class="q-px-sm">WebHook</legend>
          <div class="row q-col-gutter-md">
            <div class="col-12 q-mt-md">
              <q-input
                rounded
                dense
                outlined
                v-model="api.urlServiceStatus"
                @blur="v$.api.urlServiceStatus.$touch"
                :error="v$.api.urlServiceStatus.$error"
                error-message="URL inválida"
                label="URL WebHook Status Sessão"
                hint="Dispara a ação sempre que o status da sessão conectada ao whatsapp é alterado."
              />
            </div>
            <div class="col-12 q-mt-md">
              <q-input
                rounded
                dense
                outlined
                v-model="api.urlMessageStatus"
                @blur="v$.api.urlMessageStatus.$touch"
                :error="v$.api.urlMessageStatus.$error"
                error-message="URL inválida"
                label="URL WebHook Status Mensagem"
                hint="Dispara ação sempre que o status de uma mensagem é atualizado."
              />
            </div>
            <div class="col-12 q-mt-md">
              <q-input
                rounded
                dense
                outlined
                v-model="api.authToken"
                label="Token de autenticação"
                hint="Será enviado como authorization no header. Se existir prefixo, deverá ser informado aqui. Ex.: Bearer, Token"
              />
            </div>
          </div>
        </fieldset>

        <q-checkbox
          v-if="api.id"
          v-model="api.isActive"
          label="Ativo"
        />
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
          @click="handleAPI"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useApiConfig } from 'src/composables/api/useApiConfig'
import { useApiValidation } from 'src/composables/api/useApiValidation'

const props = defineProps({
  modalApi: {
    type: Boolean,
    required: true
  },
  apiEdicao: {
    type: Object,
    required: true
  },
  cSessions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'update:modal-api',
  'update:api-edicao',
  'modal-api-criada',
  'modal-api-editada'
])

const api = ref({
  id: null,
  name: null,
  sessionId: null,
  urlServiceStatus: null,
  urlMessageStatus: null,
  authToken: null,
  isActive: true
})

const { v$ } = useApiValidation({ api })
const { criarAPI, editarAPI, loading } = useApiConfig()

const resetarApi = () => {
  api.value = {
    id: null,
    name: null,
    sessionId: null,
    urlServiceStatus: null,
    urlMessageStatus: null,
    authToken: null,
    isActive: true
  }
}

const fecharModal = () => {
  resetarApi()
  v$.value.$reset()
  emit('update:api-edicao', { id: null })
  emit('update:modal-api', false)
}

const abrirModal = () => {
  if (props.apiEdicao.id) {
    api.value = { ...props.apiEdicao }
  } else {
    resetarApi()
  }
}

const handleAPI = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  try {
    if (api.value.id) {
      const data = await editarAPI(api.value)
      emit('modal-api-editada', data)
    } else {
      const data = await criarAPI(api.value)
      emit('modal-api-criada', data)
    }
    fecharModal()
  } catch (error) {
    console.error('Erro ao salvar API:', error)
  }
}
</script>

<style lang="scss" scoped>
.rounded-all {
  border-radius: 8px;
}
</style>
