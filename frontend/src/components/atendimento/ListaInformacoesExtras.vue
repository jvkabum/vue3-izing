<template>
  <q-list v-if="hasInfo">
    <q-item v-for="(info, idx) in infoList" :key="idx">
      <q-item-section>
        <!-- Label -->
        <q-item-label class="text-weight-medium">
          {{ info.label || 'Informação Adicional' }}
        </q-item-label>

        <!-- Value -->
        <q-item-label caption class="text-body2">
          {{ info.value }}
        </q-item-label>

        <!-- Data -->
        <q-item-label caption v-if="info.createdAt" class="text-caption">
          Adicionado em: {{ formatDate(info.createdAt) }}
        </q-item-label>
      </q-item-section>

      <!-- Ações -->
      <q-item-section side v-if="editable">
        <q-btn
          flat
          round
          dense
          icon="delete"
          color="negative"
          @click="handleDelete(info, idx)"
        >
          <q-tooltip>Remover informação</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>

  <!-- Estado Vazio -->
  <q-item v-else>
    <q-item-section>
      <q-item-label caption class="text-center">
        Nenhuma informação adicional
      </q-item-label>
    </q-item-section>
  </q-item>

  <!-- Botão Adicionar -->
  <div v-if="editable" class="q-pa-md">
    <q-btn
      flat
      color="primary"
      icon="add"
      label="Adicionar Informação"
      class="full-width"
      @click="showAddDialog = true"
    />
  </div>

  <!-- Dialog Adicionar -->
  <q-dialog v-model="showAddDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Adicionar Informação</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="newInfo.label"
          label="Rótulo"
          dense
          outlined
          class="q-mb-md"
        />
        <q-input
          v-model="newInfo.value"
          label="Valor"
          dense
          outlined
          autofocus
          :rules="[val => !!val || 'Campo obrigatório']"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" v-close-popup />
        <q-btn
          flat
          label="Salvar"
          color="primary"
          :disable="!newInfo.value"
          @click="handleAdd"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuasar } from 'quasar'

const props = defineProps({
  infoList: {
    type: Array,
    default: () => []
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add', 'delete'])

// Composables
const $q = useQuasar()

// Estado
const showAddDialog = ref(false)
const newInfo = ref({
  label: '',
  value: ''
})

// Computed
const hasInfo = computed(() => 
  Array.isArray(props.infoList) && props.infoList.length > 0
)

// Métodos
const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

const handleAdd = () => {
  if (!newInfo.value.value) return

  emit('add', { ...newInfo.value })
  
  // Reset form
  newInfo.value = {
    label: '',
    value: ''
  }
  
  showAddDialog.value = false
}

const handleDelete = (info, index) => {
  $q.dialog({
    title: 'Confirmar',
    message: 'Deseja remover esta informação?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('delete', { info, index })
  })
}
</script>

<style lang="scss" scoped>
.q-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }
}

.q-btn {
  opacity: 0.7;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
}

// Dark mode
:deep(.q-dark) {
  .q-item {
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
