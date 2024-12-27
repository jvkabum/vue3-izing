<template>
  <div v-if="userProfile === 'admin'">
    <q-card class="q-ma-md">
      <q-card-section>
        <div class="text-h6">
          Configurações API
          <q-btn
            class="float-right"
            color="primary"
            rounded
            label="Adicionar"
            style="margin: 2px;"
            @click="openAddDialog"
          />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="scroll" style="height: calc(100vh - 200px)">
        <q-item 
          v-for="api in apis" 
          :key="api.token" 
          class="q-my-md shadow-2"
        >
          <q-item-section top>
            <q-item-label class="text-bold text-h6 q-my-sm">
              Nome: {{ api.name }}
              <div class="text-grey-8 q-gutter-xs float-right">
                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="mdi-content-copy"
                  @click="handleCopyToken(api.token)"
                >
                  <q-tooltip>Copiar token</q-tooltip>
                </q-btn>
                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="edit"
                  @click="handleEditarAPI(api)"
                >
                  <q-tooltip>Editar Configuração</q-tooltip>
                </q-btn>
                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="mdi-autorenew"
                  @click="handleGerarNovoToken(api)"
                >
                  <q-tooltip>Gerar novo Token</q-tooltip>
                </q-btn>
                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="delete"
                  @click="handleDeletarApi(api)"
                >
                  <q-tooltip>Deletar Configuração</q-tooltip>
                </q-btn>
              </div>
            </q-item-label>
            <q-item-label lines="4" style="word-break: break-all;">
              <p class="text-weight-medium text-nowrap q-pr-md">
                <span class="text-bold">Url:</span>
                {{ montarUrlIntegracao(api.id) }}
              </p>
            </q-item-label>
            <q-item-label style="word-break: break-all;">
              <p class="text-weight-medium text-nowrap q-pr-md">
                <span class="text-bold">Token:</span>
                {{ api.token }}
              </p>
            </q-item-label>
            <q-item-label caption>
              <p class="text-weight-medium">
                <span class="text-bold">WebHook Status Whatsapp:</span>
                <span>{{ api.urlServiceStatus }}</span>
              </p>
            </q-item-label>
            <q-item-label caption>
              <p class="text-weight-medium">
                <span class="text-bold">WebHook Status Mensagem:</span>
                <span>{{ api.urlMessageStatus }}</span>
              </p>
            </q-item-label>
            <q-item-label style="word-break: break-all;">
              <p class="text-weight-medium text-nowrap q-pr-md">
                <span class="text-bold">Token Autenticação:</span>
                {{ api.authToken }}
              </p>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>

    <ModalApi
      :modal-api="modalApi"
      :api-edicao="apiEdicao"
      :c-sessions="[]"
      @update:modal-api="modalApi = $event"
      @update:api-edicao="apiEdicao = $event"
      @modal-api-criada="apiCriada"
      @modal-api-editada="apiEditada"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { copyToClipboard } from 'quasar'
import { useApiConfig } from 'src/composables/api/useApiConfig'
import { useApiNotification } from 'src/composables/api/useApiNotification'
import ModalApi from './ModalApi.vue'

const userProfile = ref('user')
const apiEdicao = ref({})
const modalApi = ref(false)

const {
  apis,
  listarAPIs,
  apagarAPI,
  gerarNovoToken
} = useApiConfig()

const {
  notifyTokenCopied,
  notifyTokenCopyError
} = useApiNotification()

const montarUrlIntegracao = id => `https://sua-api.com/integration/${id}`

const openAddDialog = () => {
  apiEdicao.value = {}
  modalApi.value = true
}

const handleCopyToken = text => {
  copyToClipboard(text)
    .then(() => notifyTokenCopied())
    .catch(() => notifyTokenCopyError())
}

const apiCriada = api => {
  apis.value.push(api)
}

const apiEditada = api => {
  const idx = apis.value.findIndex(f => f.id === api.id)
  if (idx > -1) {
    apis.value[idx] = api
  }
}

const handleEditarAPI = api => {
  apiEdicao.value = { ...api }
  modalApi.value = true
}

const handleGerarNovoToken = async api => {
  const updatedApi = await gerarNovoToken(api)
  if (updatedApi) {
    apiEditada(updatedApi)
  }
}

const handleDeletarApi = async api => {
  await apagarAPI(api)
}

onMounted(() => {
  const profile = localStorage.getItem('profile')
  if (profile) {
    userProfile.value = profile
  }
  listarAPIs()
})
</script>
