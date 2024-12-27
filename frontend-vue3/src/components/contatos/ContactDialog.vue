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
        <div class="text-h6">{{ isEditing ? 'Editar' : 'Novo' }} Contato</div>
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
              <!-- Avatar -->
              <div class="col-12 flex justify-center items-center">
                <q-avatar size="150px" class="cursor-pointer" @click="triggerFileInput">
                  <img :src="form.profileImage || 'default-avatar.png'" />
                  <q-file
                    v-model="avatarFile"
                    accept="image/*"
                    style="display: none"
                    @input="handleAvatarUpload"
                  />
                  <div class="absolute-bottom text-center bg-dark q-pa-xs">
                    <q-icon name="camera_alt" size="sm" />
                  </div>
                </q-avatar>
              </div>

              <!-- Nome e Sobrenome -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.firstName"
                  label="Nome *"
                  :rules="[val => !!val || 'Nome é obrigatório']"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.lastName"
                  label="Sobrenome"
                  outlined
                  dense
                />
              </div>

              <!-- Email e Telefone -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.email"
                  label="Email"
                  type="email"
                  :rules="[
                    val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Email inválido'
                  ]"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.phone"
                  label="Telefone *"
                  mask="(##) #####-####"
                  :rules="[val => !!val || 'Telefone é obrigatório']"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>

              <!-- Tags e Grupos -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.tags"
                  :options="availableTags"
                  label="Tags"
                  multiple
                  use-chips
                  outlined
                  dense
                  use-input
                  @new-value="createTag"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-chip
                          :color="scope.opt.color"
                          text-color="white"
                          dense
                        >
                          {{ scope.opt.name }}
                        </q-chip>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.groups"
                  :options="availableGroups"
                  label="Grupos"
                  multiple
                  use-chips
                  outlined
                  dense
                  use-input
                  @new-value="createGroup"
                />
              </div>

              <!-- Observações -->
              <div class="col-12">
                <q-input
                  v-model="form.notes"
                  type="textarea"
                  label="Observações"
                  outlined
                  autogrow
                />
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
                  <!-- Origem -->
                  <div class="col-12">
                    <q-select
                      v-model="form.source"
                      :options="sourceOptions"
                      label="Origem"
                      outlined
                      dense
                    />
                  </div>

                  <!-- Status -->
                  <div class="col-12">
                    <q-select
                      v-model="form.status"
                      :options="statusOptions"
                      label="Status"
                      outlined
                      dense
                    />
                  </div>

                  <!-- Redes Sociais -->
                  <div class="col-12">
                    <q-input
                      v-model="form.socialMedia.whatsapp"
                      label="WhatsApp"
                      outlined
                      dense
                    >
                      <template v-slot:prepend>
                        <q-icon name="fab fa-whatsapp" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model="form.socialMedia.facebook"
                      label="Facebook"
                      outlined
                      dense
                    >
                      <template v-slot:prepend>
                        <q-icon name="fab fa-facebook" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model="form.socialMedia.instagram"
                      label="Instagram"
                      outlined
                      dense
                    >
                      <template v-slot:prepend>
                        <q-icon name="fab fa-instagram" />
                      </template>
                    </q-input>
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
import { useContactGroups } from '../../composables/contatos/useContactGroups'
import { useTags } from '../../composables/etiquetas/useTags'

const props = defineProps({
  modelValue: Boolean,
  contact: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// Composables
const { notifyError } = useNotificationSystem()
const { groups: availableGroups, createGroup } = useContactGroups()
const { tags: availableTags, createTag } = useTags()

// Estado
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const avatarFile = ref(null)
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  profileImage: '',
  tags: [],
  groups: [],
  notes: '',
  source: 'manual',
  status: 'active',
  socialMedia: {
    whatsapp: '',
    facebook: '',
    instagram: ''
  }
})

// Computed
const isEditing = computed(() => !!props.contact)

// Opções
const sourceOptions = [
  { label: 'Manual', value: 'manual' },
  { label: 'Importação', value: 'import' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' }
]

const statusOptions = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Bloqueado', value: 'blocked' }
]

// Watch
watch(() => props.contact, (newContact) => {
  if (newContact) {
    form.value = {
      ...newContact,
      firstName: newContact.name?.split(' ')[0] || '',
      lastName: newContact.name?.split(' ').slice(1).join(' ') || '',
      socialMedia: newContact.socialMedia || {
        whatsapp: '',
        facebook: '',
        instagram: ''
      }
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Métodos
const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
    tags: [],
    groups: [],
    notes: '',
    source: 'manual',
    status: 'active',
    socialMedia: {
      whatsapp: '',
      facebook: '',
      instagram: ''
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
    // form.value.profileImage = response.data.url
  } catch (error) {
    notifyError('Erro ao fazer upload do avatar')
  }
}

const handleSubmit = () => {
  const contactData = {
    ...form.value,
    name: `${form.value.firstName} ${form.value.lastName}`.trim()
  }

  if (props.contact) {
    contactData.id = props.contact.id
  }

  emit('save', contactData)
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
