<template>
  <div class="node-config q-pa-md">
    <!-- Nome do Nó -->
    <q-input
      v-model="formData.name"
      label="Nome"
      dense
      outlined
      class="q-mb-md"
      @update:model-value="handleUpdate"
    />

    <!-- Configurações específicas por tipo -->
    <template v-if="node.type === 'message'">
      <q-input
        v-model="formData.data.message"
        label="Mensagem"
        type="textarea"
        dense
        outlined
        autogrow
        class="q-mb-md"
        @update:model-value="handleUpdate"
      />

      <q-select
        v-model="formData.data.messageType"
        :options="messageTypes"
        label="Tipo de Mensagem"
        dense
        outlined
        class="q-mb-md"
        @update:model-value="handleUpdate"
      />

      <q-file
        v-if="formData.data.messageType !== 'text'"
        v-model="formData.data.media"
        label="Mídia"
        dense
        outlined
        class="q-mb-md"
        @update:model-value="handleUpdate"
      >
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>
    </template>

    <template v-else-if="node.type === 'condition'">
      <q-select
        v-model="formData.data.conditionType"
        :options="conditionTypes"
        label="Tipo de Condição"
        dense
        outlined
        class="q-mb-md"
        @update:model-value="handleUpdate"
      />

      <q-input
        v-model="formData.data.value"
        label="Valor"
        dense
        outlined
        class="q-mb-md"
        @update:model-value="handleUpdate"
      />
    </template>

    <template v-else-if="node.type === 'action'">
      <q-select
        v-model="formData.data.actionType"
        :options="actionTypes"
        label="Tipo de Ação"
        dense
        outlined
        class="q-mb-md"
        @update:model-value="handleUpdate"
      />

      <q-input
        v-model="formData.data.params"
        label="Parâmetros"
        type="textarea"
        dense
        outlined
        autogrow
        class="q-mb-md"
        @update:model-value="handleUpdate"
      />
    </template>

    <!-- Configurações comuns -->
    <q-expansion-item
      group="config"
      icon="settings"
      label="Configurações Avançadas"
      header-class="text-primary"
    >
      <q-card>
        <q-card-section>
          <q-toggle
            v-model="formData.data.enabled"
            label="Habilitado"
            class="q-mb-md"
            @update:model-value="handleUpdate"
          />

          <q-input
            v-model.number="formData.data.delay"
            type="number"
            label="Atraso (ms)"
            dense
            outlined
            class="q-mb-md"
            @update:model-value="handleUpdate"
          />

          <q-input
            v-model="formData.data.description"
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
  node: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

// Opções
const messageTypes = [
  { label: 'Texto', value: 'text' },
  { label: 'Imagem', value: 'image' },
  { label: 'Vídeo', value: 'video' },
  { label: 'Áudio', value: 'audio' },
  { label: 'Documento', value: 'document' }
]

const conditionTypes = [
  { label: 'Igual', value: 'equals' },
  { label: 'Contém', value: 'contains' },
  { label: 'Maior que', value: 'greater' },
  { label: 'Menor que', value: 'less' },
  { label: 'Expressão', value: 'expression' }
]

const actionTypes = [
  { label: 'Webhook', value: 'webhook' },
  { label: 'API', value: 'api' },
  { label: 'Variável', value: 'variable' },
  { label: 'Script', value: 'script' }
]

// Estado do formulário
const formData = ref({
  name: props.node.name,
  data: {
    ...props.node.data,
    enabled: props.node.data?.enabled ?? true,
    delay: props.node.data?.delay ?? 0
  }
})

// Watch para mudanças no node
watch(() => props.node, (newNode) => {
  formData.value = {
    name: newNode.name,
    data: {
      ...newNode.data,
      enabled: newNode.data?.enabled ?? true,
      delay: newNode.data?.delay ?? 0
    }
  }
}, { deep: true })

// Métodos
const handleUpdate = () => {
  emit('update', {
    id: props.node.id,
    name: formData.value.name,
    data: formData.value.data
  })
}
</script>

<style lang="scss" scoped>
.node-config {
  .q-expansion-item {
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 16px;
  }
}
</style>
