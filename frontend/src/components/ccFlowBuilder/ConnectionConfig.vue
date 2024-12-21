<template>
  <div class="connection-config q-pa-md">
    <!-- Label da Conexão -->
    <q-input
      v-model="formData.label"
      label="Rótulo"
      dense
      outlined
      class="q-mb-md"
      @update:model-value="handleUpdate"
    />

    <!-- Tipo de Conexão -->
    <q-select
      v-model="formData.type"
      :options="connectionTypes"
      label="Tipo de Conexão"
      dense
      outlined
      class="q-mb-md"
      @update:model-value="handleUpdate"
    />

    <!-- Condição (para conexões condicionais) -->
    <template v-if="formData.type === 'conditional'">
      <q-select
        v-model="formData.condition.type"
        :options="conditionTypes"
        label="Tipo de Condição"
        dense
        outlined
        class="q-mb-md"
        @update:model-value="handleUpdate"
      />

      <q-input
        v-model="formData.condition.value"
        label="Valor"
        dense
        outlined
        class="q-mb-md"
        @update:model-value="handleUpdate"
      />

      <q-input
        v-if="formData.condition.type === 'expression'"
        v-model="formData.condition.expression"
        label="Expressão"
        type="textarea"
        dense
        outlined
        autogrow
        class="q-mb-md"
        @update:model-value="handleUpdate"
      />
    </template>

    <!-- Prioridade -->
    <q-input
      v-model.number="formData.priority"
      type="number"
      label="Prioridade"
      dense
      outlined
      class="q-mb-md"
      @update:model-value="handleUpdate"
    >
      <template v-slot:hint>
        Menor número = Maior prioridade
      </template>
    </q-input>

    <!-- Configurações Avançadas -->
    <q-expansion-item
      group="config"
      icon="settings"
      label="Configurações Avançadas"
      header-class="text-primary"
    >
      <q-card>
        <q-card-section>
          <!-- Habilitado/Desabilitado -->
          <q-toggle
            v-model="formData.enabled"
            label="Habilitado"
            class="q-mb-md"
            @update:model-value="handleUpdate"
          />

          <!-- Atraso -->
          <q-input
            v-model.number="formData.delay"
            type="number"
            label="Atraso (ms)"
            dense
            outlined
            class="q-mb-md"
            @update:model-value="handleUpdate"
          />

          <!-- Estilo -->
          <q-select
            v-model="formData.style.lineType"
            :options="lineTypes"
            label="Tipo de Linha"
            dense
            outlined
            class="q-mb-md"
            @update:model-value="handleUpdate"
          />

          <q-input
            v-model="formData.style.lineColor"
            type="color"
            label="Cor da Linha"
            dense
            outlined
            class="q-mb-md"
            @update:model-value="handleUpdate"
          />

          <!-- Descrição -->
          <q-input
            v-model="formData.description"
            label="Descrição"
            type="textarea"
            dense
            outlined
            autogrow
            @update:model-value="handleUpdate"
          />
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  connection: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

// Opções
const connectionTypes = [
  { label: 'Padrão', value: 'default' },
  { label: 'Condicional', value: 'conditional' },
  { label: 'Timeout', value: 'timeout' },
  { label: 'Erro', value: 'error' }
]

const conditionTypes = [
  { label: 'Igual', value: 'equals' },
  { label: 'Contém', value: 'contains' },
  { label: 'Maior que', value: 'greater' },
  { label: 'Menor que', value: 'less' },
  { label: 'Expressão', value: 'expression' }
]

const lineTypes = [
  { label: 'Reta', value: 'straight' },
  { label: 'Curva', value: 'bezier' },
  { label: 'Fluxograma', value: 'flowchart' },
  { label: 'Estado', value: 'state' }
]

// Estado do formulário
const formData = ref({
  label: props.connection.data?.label || '',
  type: props.connection.data?.type || 'default',
  condition: props.connection.data?.condition || {
    type: 'equals',
    value: '',
    expression: ''
  },
  priority: props.connection.data?.priority || 0,
  enabled: props.connection.data?.enabled ?? true,
  delay: props.connection.data?.delay || 0,
  style: props.connection.data?.style || {
    lineType: 'bezier',
    lineColor: '#666666'
  },
  description: props.connection.data?.description || ''
})

// Watch para mudanças na conexão
watch(() => props.connection, (newConnection) => {
  formData.value = {
    label: newConnection.data?.label || '',
    type: newConnection.data?.type || 'default',
    condition: newConnection.data?.condition || {
      type: 'equals',
      value: '',
      expression: ''
    },
    priority: newConnection.data?.priority || 0,
    enabled: newConnection.data?.enabled ?? true,
    delay: newConnection.data?.delay || 0,
    style: newConnection.data?.style || {
      lineType: 'bezier',
      lineColor: '#666666'
    },
    description: newConnection.data?.description || ''
  }
}, { deep: true })

// Métodos
const handleUpdate = () => {
  emit('update', {
    id: props.connection.id,
    data: { ...formData.value }
  })
}
</script>

<style lang="scss" scoped>
.connection-config {
  .q-expansion-item {
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 16px;
  }
}
</style>
