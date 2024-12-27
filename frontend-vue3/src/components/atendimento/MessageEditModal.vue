<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card>
      <q-card-section>
        <div class="text-h6">Editar Mensagem</div>
      </q-card-section>

      <q-card-section>
        <q-input 
          filled 
          :model-value="mensagemAtual.body"
          @update:model-value="$emit('update:mensagemAtual', { ...mensagemAtual, body: $event })"
          label="Mensagem" 
          autofocus
          @keyup.enter="handleSave"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn 
          label="Cancelar" 
          color="negative" 
          @click="$emit('update:modelValue', false)"
        />
        <q-btn 
          label="Salvar" 
          color="primary" 
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  mensagemAtual: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'update:mensagemAtual', 'salvar'])

const handleSave = () => {
  emit('salvar')
  emit('update:modelValue', false)
}
</script>
