<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center">
        <div class="text-h6">Gerenciar Atendentes</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <!-- Busca de Atendentes -->
        <q-input
          v-model="searchTerm"
          label="Buscar atendentes"
          outlined
          dense
          class="q-mb-md"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- Lista de Atendentes -->
        <div class="row q-col-gutter-md">
          <!-- Atendentes Disponíveis -->
          <div class="col-12 col-md-6">
            <div class="text-subtitle2 q-mb-sm">Atendentes Disponíveis</div>
            <q-list bordered separator>
              <q-item
                v-for="agent in availableAgents"
                :key="agent.id"
                clickable
                v-ripple
                @click="addAgent(agent)"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="agent.avatar || 'default-avatar.png'" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ agent.name }}</q-item-label>
                  <q-item-label caption>{{ agent.email }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="positive"
                    icon="add"
                    size="sm"
                  >
                    <q-tooltip>Adicionar à fila</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Atendentes na Fila -->
          <div class="col-12 col-md-6">
            <div class="text-subtitle2 q-mb-sm">Atendentes na Fila</div>
            <q-list bordered separator>
              <q-item
                v-for="agent in selectedAgents"
                :key="agent.id"
                clickable
                v-ripple
                @click="removeAgent(agent)"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="agent.avatar || 'default-avatar.png'" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ agent.name }}</q-item-label>
                  <q-item-label caption>{{ agent.email }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="remove"
                    size="sm"
                  >
                    <q-tooltip>Remover da fila</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Configurações dos Atendentes -->
        <div class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">Configurações dos Atendentes</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="settings.maxConcurrent"
                label="Máximo de Atendimentos Simultâneos"
                type="number"
                outlined
                dense
                min="1"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="settings.priority"
                :options="priorityOptions"
                label="Prioridade de Distribuição"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" v-close-popup />
        <q-btn label="Salvar" color="primary" @click="handleSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUsers } from '../../composables/usuarios/useUsers'

const props = defineProps({
  modelValue: Boolean,
  queue: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// Composables
const { users: allUsers } = useUsers()

// Estado
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const searchTerm = ref('')
const selectedAgents = ref([])
const settings = ref({
  maxConcurrent: 3,
  priority: 'round-robin'
})

// Opções
const priorityOptions = [
  { label: 'Round-Robin', value: 'round-robin' },
  { label: 'Menos Ocupado', value: 'least-busy' },
  { label: 'Aleatório', value: 'random' }
]

// Computed
const availableAgents = computed(() => {
  let agents = allUsers.value.filter(user => 
    user.role === 'agent' && !selectedAgents.value.find(a => a.id === user.id)
  )

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    agents = agents.filter(agent =>
      agent.name.toLowerCase().includes(search) ||
      agent.email.toLowerCase().includes(search)
    )
  }

  return agents
})

// Watch
watch(() => props.queue, (newQueue) => {
  if (newQueue) {
    selectedAgents.value = [...(newQueue.agents || [])]
    settings.value = {
      maxConcurrent: newQueue.settings?.agentMaxConcurrent || 3,
      priority: newQueue.settings?.distributionPriority || 'round-robin'
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Métodos
const resetForm = () => {
  selectedAgents.value = []
  settings.value = {
    maxConcurrent: 3,
    priority: 'round-robin'
  }
  searchTerm.value = ''
}

const addAgent = (agent) => {
  selectedAgents.value.push(agent)
}

const removeAgent = (agent) => {
  selectedAgents.value = selectedAgents.value.filter(a => a.id !== agent.id)
}

const handleSave = () => {
  emit('save', {
    agents: selectedAgents.value,
    settings: {
      agentMaxConcurrent: settings.value.maxConcurrent,
      distributionPriority: settings.value.priority
    }
  })
}

defineExpose({
  resetForm
})
</script>

<style lang="scss" scoped>
.q-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
