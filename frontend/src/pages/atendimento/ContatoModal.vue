<template>
  <q-dialog v-model="isVisible">
    <q-card>
      <q-card-section>
        <div class="text-h6">Adicionar Contato</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="localContact.name" label="Nome" />
        <q-input v-model="localContact.number" label="Número" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="close" />
        <q-btn flat label="Salvar" color="primary" @click="saveContact" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  value: {
    type: Boolean,
    required: true
  },
  contact: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'saveContact'])

const isVisible = ref(props.value)
const localContact = ref({ ...props.contact })

watch(() => props.value, (newVal) => {
  isVisible.value = newVal
})

watch(() => props.contact, (newContact) => {
  localContact.value = { ...newContact }
})

const close = () => {
  emit('close')
}

const saveContact = () => {
  emit('saveContact', localContact.value)
  close()
}
</script>

<style scoped>
.contact-card {
  border: 1px solid #ccc;
  padding: 1em;
  margin: 1em 0;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>
