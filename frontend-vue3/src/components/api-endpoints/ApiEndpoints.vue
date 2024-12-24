<template>
  <div class="api-endpoints">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">API Endpoints</div>
      <q-btn
        color="primary"
        icon="add"
        label="Novo Endpoint"
        @click="openDialog()"
      />
    </div>

    <!-- Lista de Endpoints -->
    <q-list separator>
      <q-item
        v-for="endpoint in endpoints"
        :key="endpoint.id"
        class="q-py-md"
      >
        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ endpoint.name }}
          </q-item-label>
          <q-item-label caption>
            <div class="row items-center">
              <q-chip
                :color="methodColors[endpoint.method]"
                text-color="white"
                dense
                class="q-mr-sm"
              >
                {{ endpoint.method }}
              </q-chip>
              <span class="text-mono">{{ endpoint.path }}</span>
            </div>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center">
            <q-btn
              flat
              round
              color="primary"
              icon="content_copy"
              @click="copyEndpoint(endpoint)"
            >
              <q-tooltip>Copiar URL</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              @click="openDialog(endpoint)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="confirmDelete(endpoint)"
            >
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Dialog para Criar/Editar -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editingEndpoint ? 'Editar' : 'Novo' }} Endpoint</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveEndpoint">
            <q-input
              v-model="form.name"
              label="Nome"
              :rules="[val => !!val || 'Nome é obrigatório']"
              class="q-mb-md"
            />

            <q-select
              v-model="form.method"
              :options="['GET', 'POST', 'PUT', 'DELETE', 'PATCH']"
              label="Método"
              :rules="[val => !!val || 'Método é obrigatório']"
              class="q-mb-md"
            />

            <q-input
              v-model="form.path"
              label="Caminho"
              :rules="[val => !!val || 'Caminho é obrigatório']"
              class="q-mb-md"
            />

            <q-input
              v-model="form.description"
              type="textarea"
              label="Descrição"
              class="q-mb-md"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn
                flat
                label="Cancelar"
                color="primary"
                v-close-popup
              />
              <q-btn
                type="submit"
                label="Salvar"
                color="primary"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog de Confirmação -->
    <q-dialog v-model="showConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">Deseja realmente excluir este endpoint?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Excluir" color="negative" @click="deleteEndpoint" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '../../composables/api/useApi'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import { useQuasar } from 'quasar'

// Composables
const { notifySuccess, notifyError } = useNotificationSystem()
const $q = useQuasar()

// Estado
const endpoints = ref([])
const showDialog = ref(false)
const showConfirmDialog = ref(false)
const editingEndpoint = ref(null)
const endpointToDelete = ref(null)

const form = ref({
  name: '',
  method: 'GET',
  path: '',
  description: ''
})

// Constantes
const methodColors = {
  GET: 'primary',
  POST: 'positive',
  PUT: 'warning',
  DELETE: 'negative',
  PATCH: 'info'
}

// Métodos
const openDialog = (endpoint = null) => {
  editingEndpoint.value = endpoint
  if (endpoint) {
    form.value = { ...endpoint }
  } else {
    form.value = {
      name: '',
      method: 'GET',
      path: '',
      description: ''
    }
  }
  showDialog.value = true
}

const saveEndpoint = async () => {
  try {
    if (editingEndpoint.value) {
      // Atualizar endpoint existente
      await updateEndpoint(form.value)
      notifySuccess('Endpoint atualizado com sucesso')
    } else {
      // Criar novo endpoint
      await createEndpoint(form.value)
      notifySuccess('Endpoint criado com sucesso')
    }
    showDialog.value = false
    loadEndpoints()
  } catch (error) {
    notifyError('Erro ao salvar endpoint')
  }
}

const confirmDelete = (endpoint) => {
  endpointToDelete.value = endpoint
  showConfirmDialog.value = true
}

const deleteEndpoint = async () => {
  try {
    await deleteEndpointApi(endpointToDelete.value.id)
    notifySuccess('Endpoint excluído com sucesso')
    loadEndpoints()
  } catch (error) {
    notifyError('Erro ao excluir endpoint')
  }
}

const copyEndpoint = (endpoint) => {
  const baseUrl = process.env.VUE_APP_API_URL || ''
  const url = `${baseUrl}${endpoint.path}`
  
  navigator.clipboard.writeText(url).then(() => {
    notifySuccess('URL copiada para a área de transferência')
  }).catch(() => {
    notifyError('Erro ao copiar URL')
  })
}

const loadEndpoints = async () => {
  try {
    const { data } = await getEndpoints()
    endpoints.value = data
  } catch (error) {
    notifyError('Erro ao carregar endpoints')
  }
}

// Lifecycle
onMounted(() => {
  loadEndpoints()
})
</script>

<style lang="scss" scoped>
.api-endpoints {
  padding: 20px;

  .text-mono {
    font-family: monospace;
  }

  .q-item {
    border-radius: 8px;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(0,0,0,0.03);
    }
  }

  .dark & {
    .q-item:hover {
      background-color: rgba(255,255,255,0.03);
    }
  }
}
</style>
