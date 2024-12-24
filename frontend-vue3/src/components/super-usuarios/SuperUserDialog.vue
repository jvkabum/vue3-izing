<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ isEditing ? 'Editar' : 'Novo' }} Super Usuário</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- Avatar -->
          <div class="row justify-center q-mb-md">
            <q-avatar size="150px" class="cursor-pointer" @click="triggerFileInput">
              <img :src="form.avatar || 'default-avatar.png'" />
              <q-file
                v-model="avatarFile"
                accept="image/*"
                style="display: none"
                @input="handleAvatarUpload"
              />
              <div class="absolute-bottom text-center bg-dark q-pa-xs">
                <q-icon name="add_photo_alternate" size="sm" />
              </div>
            </q-avatar>
          </div>

          <!-- Informações Básicas -->
          <div class="row q-col-gutter-md">
            <!-- Nome e Email -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.name"
                label="Nome Completo *"
                :rules="[val => !!val || 'Nome é obrigatório']"
                outlined
                dense
              />
            </div>
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

            <!-- Senha (apenas para novo usuário) -->
            <template v-if="!isEditing">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.password"
                  label="Senha *"
                  type="password"
                  :rules="[
                    val => !!val || 'Senha é obrigatória',
                    val => val.length >= 8 || 'Mínimo de 8 caracteres'
                  ]"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.confirmPassword"
                  label="Confirmar Senha *"
                  type="password"
                  :rules="[
                    val => !!val || 'Confirmação é obrigatória',
                    val => val === form.password || 'Senhas não conferem'
                  ]"
                  outlined
                  dense
                />
              </div>
            </template>

            <!-- Função e Status -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.role"
                :options="roleOptions"
                label="Função *"
                :rules="[val => !!val || 'Função é obrigatória']"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.status"
                :options="statusOptions"
                label="Status *"
                :rules="[val => !!val || 'Status é obrigatório']"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
          </div>

          <!-- Permissões -->
          <q-expansion-item
            icon="security"
            label="Permissões"
            header-class="text-primary"
            default-opened
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Módulos -->
                  <div class="col-12">
                    <div class="text-subtitle2 q-mb-sm">Módulos</div>
                    <div class="row q-col-gutter-sm">
                      <div
                        v-for="module in moduleOptions"
                        :key="module.value"
                        class="col-12 col-md-4"
                      >
                        <q-card flat bordered>
                          <q-card-section>
                            <div class="row items-center q-mb-sm">
                              <q-checkbox
                                v-model="form.permissions.modules"
                                :val="module.value"
                                :label="module.label"
                              />
                            </div>
                            <div class="row q-gutter-x-sm">
                              <q-checkbox
                                v-for="action in actionOptions"
                                :key="action.value"
                                v-model="form.permissions[`${module.value}_${action.value}`]"
                                :label="action.label"
                                dense
                              />
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </div>

                  <!-- Restrições -->
                  <div class="col-12">
                    <div class="text-subtitle2 q-mb-sm">Restrições</div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <q-select
                          v-model="form.restrictions.companies"
                          :options="companyOptions"
                          label="Empresas"
                          multiple
                          use-chips
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-select
                          v-model="form.restrictions.queues"
                          :options="queueOptions"
                          label="Filas"
                          multiple
                          use-chips
                          outlined
                          dense
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Configurações -->
          <q-expansion-item
            icon="settings"
            label="Configurações"
            header-class="text-primary"
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Notificações -->
                  <div class="col-12">
                    <div class="text-subtitle2 q-mb-sm">Notificações</div>
                    <q-checkbox
                      v-model="form.settings.emailNotifications"
                      label="Receber notificações por email"
                    />
                  </div>

                  <!-- Autenticação -->
                  <div class="col-12">
                    <div class="text-subtitle2 q-mb-sm">Autenticação</div>
                    <q-checkbox
                      v-model="form.settings.twoFactorAuth"
                      label="Autenticação em dois fatores"
                    />
                  </div>

                  <!-- Sessão -->
                  <div class="col-12">
                    <div class="text-subtitle2 q-mb-sm">Sessão</div>
                    <q-input
                      v-model.number="form.settings.sessionTimeout"
                      label="Timeout da Sessão (minutos)"
                      type="number"
                      outlined
                      dense
                      min="5"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" v-close-popup />
        <q-btn
          :label="isEditing ? 'Salvar' : 'Criar'"
          color="primary"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// Estado
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const avatarFile = ref(null)
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  avatar: '',
  role: '',
  status: 'active',
  permissions: {
    modules: [],
  },
  restrictions: {
    companies: [],
    queues: []
  },
  settings: {
    emailNotifications: true,
    twoFactorAuth: false,
    sessionTimeout: 30
  }
})

// Computed
const isEditing = computed(() => !!props.user)

// Opções
const roleOptions = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Supervisor', value: 'supervisor' },
  { label: 'Gerente', value: 'manager' }
]

const statusOptions = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Bloqueado', value: 'blocked' }
]

const moduleOptions = [
  { label: 'Usuários', value: 'users' },
  { label: 'Empresas', value: 'companies' },
  { label: 'Filas', value: 'queues' },
  { label: 'Relatórios', value: 'reports' },
  { label: 'Configurações', value: 'settings' },
  { label: 'Integrações', value: 'integrations' }
]

const actionOptions = [
  { label: 'Visualizar', value: 'view' },
  { label: 'Criar', value: 'create' },
  { label: 'Editar', value: 'edit' },
  { label: 'Excluir', value: 'delete' }
]

const companyOptions = [
  { label: 'Empresa A', value: 1 },
  { label: 'Empresa B', value: 2 },
  { label: 'Empresa C', value: 3 }
]

const queueOptions = [
  { label: 'Suporte', value: 1 },
  { label: 'Vendas', value: 2 },
  { label: 'Financeiro', value: 3 }
]

// Watch
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.value = {
      ...form.value,
      ...newUser,
      password: '',
      confirmPassword: ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Métodos
const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    role: '',
    status: 'active',
    permissions: {
      modules: [],
    },
    restrictions: {
      companies: [],
      queues: []
    },
    settings: {
      emailNotifications: true,
      twoFactorAuth: false,
      sessionTimeout: 30
    }
  }
  avatarFile.value = null
}

const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]')
  fileInput?.click()
}

const handleAvatarUpload = async (file) => {
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('avatar', file)
    
    // Implementar upload do avatar
    // const response = await uploadAvatar(formData)
    // form.value.avatar = response.data.url
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error)
  }
}

const handleSubmit = () => {
  const userData = { ...form.value }
  
  // Remove campos de senha se estiver editando
  if (isEditing.value) {
    delete userData.password
    delete userData.confirmPassword
  }

  emit('save', userData)
}

defineExpose({
  resetForm
})
</script>

<style lang="scss" scoped>
.q-expansion-item {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  margin-bottom: 8px;

  .q-card {
    box-shadow: none;
  }
}

.dark {
  .q-expansion-item {
    border-color: rgba(255, 255, 255, 0.12);
  }
}
</style>
