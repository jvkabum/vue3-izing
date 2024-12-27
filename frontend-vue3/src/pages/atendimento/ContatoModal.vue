<template>
  <q-dialog v-model="isVisible">
    <q-card>
      <q-card-section>
        <div class="text-h6">Adicionar Contato</div>
      </q-card-section>
      <q-card-section>
        <q-input 
          v-model="localContact.name" 
          label="Nome" 
          :rules="[val => !!val || 'Nome é obrigatório']"
        />
        <q-input 
          v-model="localContact.number" 
          label="Número"
          :rules="[val => !!val || 'Número é obrigatório']"
          @blur="localContact.number = formatPhoneNumber(localContact.number)"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn 
          flat 
          label="Cancelar" 
          @click="close" 
        />
        <q-btn 
          flat 
          label="Salvar" 
          color="primary" 
          @click="saveContact" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useContatoAtendimento } from 'src/composables/atendimento/useContatoAtendimento'

const props = defineProps({
  value: {
    type: Boolean,
    required: true
  },
  contact: {
    type: Object,
    required: true
  },
  ticket: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'save-contact'])

const isVisible = ref(props.value)
const localContact = ref({ ...props.contact })

const { formatPhoneNumber } = useContatoAtendimento(props)

watch(() => props.value, newVal => {
  isVisible.value = newVal
})

watch(() => props.contact, newContact => {
  localContact.value = { ...newContact }
})

const close = () => {
  emit('close')
}

const saveContact = () => {
  if (!localContact.value.name || !localContact.value.number) {
    return
  }
  
  emit('save-contact', {
    ...localContact.value,
    number: formatPhoneNumber(localContact.value.number)
  })
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
