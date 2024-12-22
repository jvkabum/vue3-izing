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
        <q-item v-for="api in apis" :key="api.token" class="q-my-md shadow-2">
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
                  @click="copy(api.token)"
                >
                  <q-tooltip>
                    Copiar token
                  </q-tooltip>
                </q-btn>
                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="edit"
                  @click="editarAPI(api)"
                >
                  <q-tooltip>
                    Editar Configuração
                  </q-tooltip>
                </q-btn>
                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="mdi-autorenew"
                  @click="gerarNovoToken(api)"
                >
                  <q-tooltip>
                    Gerar novo Token
                  </q-tooltip>
                </q-btn>
                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="delete"
                  @click="deletarApi(api)"
                >
                  <q-tooltip>
                    Deletar Configuração
                  </q-tooltip>
                </q-btn>
              </div>
            </q-item-label>
            <q-item-label lines="4" style="word-break: break-all;">
              <p class="text-weight-medium text-nowrap q-pr-md">
                <span class="text-bold">Url:</span>
                {{ montarUrlIntegração(api.id) }}
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
                <span class="text-bold">WebHook Status Whatsapp:</span> <span> {{ api.urlServiceStatus }} </span>
              </p>
            </q-item-label>
            <q-item-label caption>
              <p class="text-weight-medium">
                <span class="text-bold">WebHook Status Mensagem:</span> <span> {{ api.urlMessageStatus }} </span>
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
      :modalApi.sync="modalApi"
      :apiEdicao.sync="apiEdicao"
      @modal-api:criada="apiCriada"
      @modal-api:editada="apiEditada"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ListarAPIs, ApagarAPI, NovoTokenAPI } from 'src/service/api'
import { copyToClipboard } from 'quasar'
import ModalApi from './ModalApi.vue'

const userProfile = ref('user')
const apiEdicao = ref({})
const modalApi = ref(false)
const apis = ref([])
const loading = ref(false)

const listarAPIs = async () => {
  const { data } = await ListarAPIs()
  apis.value = data.apis
}

const copy = (text) => {
  copyToClipboard(text)
    .then(() => {
      this.$q.notify('Token copiado!')
    })
    .catch()
}

const apiCriada = (api) => {
  apis.value.push(api)
}

const apiEditada = (api) => {
  const idx = apis.value.findIndex(f => f.id === api.id)
  if (idx > -1) {
    apis.value[idx] = api
  }
}

const editarAPI = (api) => {
  apiEdicao.value = { ...api }
  modalApi.value = true
}

const gerarNovoToken = async (api) => {
  const confirm = await this.$q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente gerar novo token para "${api.name}"? Lembre que as integrações que utilizam atual irão parar de funcionar até que atualize o token onde for necessário.`,
    cancel: { label: 'Não', color: 'primary', push: true },
    ok: { label: 'Sim', color: 'negative', push: true },
    persistent: true
  })

  if (confirm) {
    loading.value = true
    try {
      const { data } = await NovoTokenAPI(api)
      apiEditada(data)
      this.$q.notify('Token atualizado!')
    } catch (error) {
      this.$q.notify('Não foi possível atualizar o token', error)
    } finally {
      loading.value = false
    }
  }
}

const deletarApi = async (api) => {
  const confirm = await this.$q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar "${api.name}"?`,
    cancel: { label: 'Não', color: 'primary', push: true },
    ok: { label: 'Sim', color: 'negative', push: true },
    persistent: true
  })

  if (confirm) {
    loading.value = true
    try {
      await ApagarAPI(api)
      apis.value = apis.value.filter(a => a.id !== api.id)
      this.$q.notify(`${api.name} deletada!`)
    } catch (error) {
      this.$q.notify(`Não foi possível deletar ${api.name}`, error)
    } finally {
      loading.value = false
    }
  }
}

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
  listarAPIs()
})
</script>

<style scoped>
</style>
