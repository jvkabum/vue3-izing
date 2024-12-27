<template>
  <q-dialog
    persistent
    :model-value="modalUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 600px">
      <q-card-section>
        <div class="text-h6">Cadastrar Usuário</div>
      </q-card-section>
      <q-card-section class="q-col-gutter-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <c-input
              outlined
              v-model.trim="form.name"
              :validator="v$.form.name"
              @blur="v$.form.name.$touch"
              label="Nome"
            />
          </div>
          <div class="col-12">
            <c-input
              outlined
              :validator="v$.form.email"
              @blur="v$.form.email.$touch"
              v-model.trim="form.email"
              label="E-mail"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <c-input
              outlined
              v-model="form.password"
              :validator="v$.form.password"
              @blur="v$.form.password.$touch"
              :type="showPassword ? 'text' : 'password'"
              label="Senha"
            >
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </c-input>
          </div>
          <div class="col-12">
            <q-select
              :disable="isProfile"
              outlined
              rounded
              dense
              v-model="form.profile"
              :options="profileOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Perfil"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          rounded
          label="Sair"
          class="q-px-md q-mr-sm"
          color="negative"
          v-close-popup
        />
        <q-btn
          rounded
          label="Salvar"
          class="q-px-md"
          color="primary"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, email, minLength, maxLength } from '@vuelidate/validators'
import { AdminUpdateUsuarios } from 'src/service/user'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user'
import { storeToRefs } from 'pinia'

interface UserForm {
  id?: number
  name: string
  email: string
  password: string
  profile: 'admin' | 'user'
  tenantId?: string
  userId?: number
  username?: string
}

interface ProfileOption {
  value: 'admin' | 'user'
  label: string
}

const props = defineProps<{
  modalUsuario: boolean
  isProfile: boolean
  usuarioEdicao: Partial<UserForm>
}>()

const emit = defineEmits<{
  'update:modalUsuario': [value: boolean]
  'update:usuarioEdicao': [value: Partial<UserForm>]
  'modal-usuario-editado': [data: UserForm]
}>()

// Composables
const $q = useQuasar()
const userStore = useUserStore()
const { isAdmin } = storeToRefs(userStore)

// Estado reativo
const showPassword = ref(false)
const profileOptions: ProfileOption[] = [
  { value: 'user', label: 'Usuário' },
  { value: 'admin', label: 'Administrador' }
]

const form = reactive<UserForm>({
  name: '',
  email: '',
  password: '',
  profile: 'user'
})

// Validações
const rules = computed(() => ({
  form: {
    name: { required, minLength: minLength(3), maxLength: maxLength(50) },
    email: { required, email },
    profile: { required },
    password: form.id ? {} : {
      required,
      minLength: minLength(6),
      maxLength: maxLength(50)
    }
  }
}))

const v$ = useVuelidate(rules, { form })

// Métodos
const abrirModal = () => {
  if (props.usuarioEdicao.id) {
    Object.assign(form, props.usuarioEdicao)
  }
  if (props.usuarioEdicao.userId) {
    Object.assign(form, {
      ...props.usuarioEdicao,
      id: props.usuarioEdicao.userId,
      name: props.usuarioEdicao.username,
      profile: props.usuarioEdicao.profile
    })
  }
}

const fecharModal = () => {
  if (!props.isProfile) {
    emit('update:usuarioEdicao', {})
  }
  emit('update:modalUsuario', false)
  Object.assign(form, {
    name: '',
    email: '',
    password: '',
    profile: 'user'
  })
  showPassword.value = false
  v$.value.$reset()
}

const handleSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$error) {
    $q.notify({
      type: 'warning',
      progress: true,
      position: 'top',
      message: 'Ops! Verifique os erros...',
      actions: [{ icon: 'close', round: true, color: 'white' }]
    })
    return
  }

  try {
    if (form.id) {
      const params: Partial<UserForm> = {
        email: form.email,
        id: form.id,
        name: form.name,
        tenantId: form.tenantId,
        password: form.password
      }

      if (isAdmin.value) {
        params.profile = form.profile
      }

      const { data } = await AdminUpdateUsuarios(form.id, params)
      emit('modal-usuario-editado', data)
      
      // Evento global usando CustomEvent
      window.dispatchEvent(new CustomEvent('usuario-editado', { detail: data }))
      
      $q.notify({
        type: 'info',
        progress: true,
        position: 'top',
        message: 'Usuário editado!',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
      
      emit('update:modalUsuario', false)
    }
  } catch (err: any) {
    console.error(err)
    if (err.data?.error === 'ERR_USER_LIMIT_USER_CREATION') {
      $q.notify({
        type: 'negative',
        message: 'Limite de usuario atingido.',
        caption: 'ERR_USER_LIMIT_USER_CREATION',
        position: 'top',
        progress: true
      })
    } else if (err.data?.error === 'ERR_EMAIL_ALREADY_REGISTERED') {
      $q.notify({
        type: 'negative',
        message: 'Este e-mail já está cadastrado.',
        caption: 'ERR_EMAIL_ALREADY_REGISTERED',
        position: 'top',
        progress: true
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Não foi possível alterar o usuário.',
        caption: 'ERR_UNKNOWN_ERROR',
        position: 'top',
        progress: true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
