<template>
  <q-dialog
    v-model="showDialog"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card>
      <q-bar class="bg-primary text-white">
        <div class="text-h6">{{ isEditing ? 'Editar' : 'Nova' }} Empresa</div>
        <q-space />
        <q-btn dense flat icon="close" @click="closeDialog">
          <q-tooltip>Fechar</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section class="q-pa-md">
        <q-form @submit="handleSubmit" class="row q-col-gutter-md">
          <!-- Informações Básicas -->
          <div class="col-12 col-md-8">
            <div class="row q-col-gutter-md">
              <!-- Logo -->
              <div class="col-12 flex justify-center items-center">
                <q-avatar size="150px" class="cursor-pointer" @click="triggerFileInput">
                  <img :src="form.logo || 'default-company-logo.png'" />
                  <q-file
                    v-model="logoFile"
                    accept="image/*"
                    style="display: none"
                    @input="handleLogoUpload"
                  />
                  <div class="absolute-bottom text-center bg-dark q-pa-xs">
                    <q-icon name="add_photo_alternate" size="sm" />
                  </div>
                </q-avatar>
              </div>

              <!-- Nome e Razão Social -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.name"
                  label="Nome Fantasia *"
                  :rules="[val => !!val || 'Nome é obrigatório']"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.legalName"
                  label="Razão Social *"
                  :rules="[val => !!val || 'Razão Social é obrigatória']"
                  outlined
                  dense
                />
              </div>

              <!-- CNPJ e Inscrição Estadual -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.document"
                  label="CNPJ *"
                  mask="##.###.###/####-##"
                  :rules="[
                    val => !!val || 'CNPJ é obrigatório',
                    val => validateCNPJ(val) || 'CNPJ inválido'
                  ]"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.stateRegistration"
                  label="Inscrição Estadual"
                  outlined
                  dense
                />
              </div>

              <!-- Email e Telefone -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.email"
                  label="Email *"
                  type="email"
                  :rules="[
                    val => !!val || 'Email é obrigatório',
                    val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Email inválido'
                  ]"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.phone"
                  label="Telefone *"
                  mask="(##) ####-####"
                  :rules="[val => !!val || 'Telefone é obrigatório']"
                  outlined
                  dense
                />
              </div>

              <!-- Endereço -->
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Endereço</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="form.address.zipCode"
                      label="CEP"
                      mask="#####-###"
                      outlined
                      dense
                      @blur="searchZipCode"
                    />
                  </div>
                  <div class="col-12 col-md-7">
                    <q-input
                      v-model="form.address.street"
                      label="Logradouro"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input
                      v-model="form.address.number"
                      label="Número"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.address.complement"
                      label="Complemento"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.address.neighborhood"
                      label="Bairro"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="form.address.city"
                      label="Cidade"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="form.address.state"
                      :options="stateOptions"
                      label="Estado"
                      outlined
                      dense
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Informações Adicionais -->
          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6">Informações Adicionais</div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Status -->
                  <div class="col-12">
                    <q-select
                      v-model="form.status"
                      :options="statusOptions"
                      label="Status"
                      outlined
                      dense
                      emit-value
                      map-options
                    />
                  </div>

                  <!-- Plano -->
                  <div class="col-12">
                    <q-select
                      v-model="form.plan"
                      :options="planOptions"
                      label="Plano"
                      outlined
                      dense
                      emit-value
                      map-options
                    />
                  </div>

                  <!-- Data de Expiração -->
                  <div class="col-12">
                    <q-input
                      v-model="form.expirationDate"
                      label="Data de Expiração"
                      type="date"
                      outlined
                      dense
                    />
                  </div>

                  <!-- Observações -->
                  <div class="col-12">
                    <q-input
                      v-model="form.notes"
                      label="Observações"
                      type="textarea"
                      outlined
                      autogrow
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Botões -->
          <div class="col-12 flex justify-end q-gutter-sm">
            <q-btn
              label="Cancelar"
              color="grey"
              flat
              @click="closeDialog"
            />
            <q-btn
              :label="isEditing ? 'Salvar' : 'Criar'"
              type="submit"
              color="primary"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'

const props = defineProps({
  modelValue: Boolean,
  company: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// Composables
const { notifyError } = useNotificationSystem()

// Estado
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const logoFile = ref(null)
const form = ref({
  name: '',
  legalName: '',
  document: '',
  stateRegistration: '',
  email: '',
  phone: '',
  logo: '',
  status: 'active',
  plan: 'basic',
  expirationDate: '',
  notes: '',
  address: {
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  }
})

// Computed
const isEditing = computed(() => !!props.company)

// Opções
const statusOptions = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Bloqueado', value: 'blocked' },
  { label: 'Pendente', value: 'pending' }
]

const planOptions = [
  { label: 'Básico', value: 'basic' },
  { label: 'Profissional', value: 'professional' },
  { label: 'Empresarial', value: 'enterprise' }
]

const stateOptions = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

// Watch
watch(() => props.company, (newCompany) => {
  if (newCompany) {
    form.value = { ...newCompany }
  } else {
    resetForm()
  }
}, { immediate: true })

// Métodos
const resetForm = () => {
  form.value = {
    name: '',
    legalName: '',
    document: '',
    stateRegistration: '',
    email: '',
    phone: '',
    logo: '',
    status: 'active',
    plan: 'basic',
    expirationDate: '',
    notes: '',
    address: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  }
  logoFile.value = null
}

const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]')
  fileInput?.click()
}

const handleLogoUpload = async (file) => {
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('logo', file)
    
    // Implementar upload do logo
    // const response = await uploadLogo(formData)
    // form.value.logo = response.data.url
  } catch (error) {
    notifyError('Erro ao fazer upload do logo')
  }
}

const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]/g, '')
  
  if (cnpj.length !== 14) return false
  
  // Validação básica de CNPJ
  if (/^(\d)\1+$/.test(cnpj)) return false
  
  // Implementar validação completa se necessário
  return true
}

const searchZipCode = async () => {
  const cep = form.value.address.zipCode.replace(/\D/g, '')
  if (cep.length !== 8) return

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await response.json()
    
    if (!data.erro) {
      form.value.address = {
        ...form.value.address,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      }
    }
  } catch (error) {
    notifyError('Erro ao buscar CEP')
  }
}

const handleSubmit = () => {
  const companyData = { ...form.value }

  if (props.company) {
    companyData.id = props.company.id
  }

  emit('save', companyData)
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

defineExpose({
  resetForm
})
</script>

<style lang="scss" scoped>
.q-dialog__inner {
  &--maximized {
    > .q-card {
      max-width: 1200px !important;
      margin: 24px auto;
    }
  }
}
</style>
