<template>
  <q-dialog
    v-model="isOpen"
    persistent
    @hide="onClose"
  >
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ dialogTitle }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            v-model="form.name"
            label="Nome da Campanha"
            :rules="[val => !!val || 'Nome é obrigatório']"
            outlined
            dense
            class="q-mb-md"
          />

          <q-select
            v-model="form.status"
            :options="statusOptions"
            label="Status"
            outlined
            dense
            class="q-mb-md"
          />

          <div class="row justify-end q-mt-md">
            <q-btn
              label="Cancelar"
              color="negative"
              flat
              v-close-popup
            />
            <q-btn
              label="Salvar"
              type="submit"
              color="primary"
              class="q-ml-sm"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useForm } from '../../composables/useForm'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  campaign: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:isOpen', 'save'])

const statusOptions = [
  'ACTIVE',
  'INACTIVE',
  'SCHEDULED'
]

const { form, resetForm } = useForm({
  name: '',
  status: 'ACTIVE'
})

const dialogTitle = computed(() => 
  props.campaign ? 'Editar Campanha' : 'Nova Campanha'
)

watch(() => props.campaign, (newCampaign) => {
  if (newCampaign) {
    form.value = { ...newCampaign }
  } else {
    resetForm()
  }
}, { immediate: true })

const onSubmit = async () => {
  try {
    emit('save', { ...form.value })
    emit('update:isOpen', false)
  } catch (error) {
    console.error('Erro ao salvar campanha:', error)
  }
}

const onClose = () => {
  resetForm()
  emit('update:isOpen', false)
}
</script>
