<template>
  <q-dialog
    persistent
    :value="modalUsuario"
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
            <q-select
              outlined
              rounded
              dense
              v-model="usuario.tenantId"
              :options="filteredTenants"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Empresa"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <c-input
              outlined
              v-model.trim="usuario.name"
              :validator="v$.usuario.name"
              @blur="v$.usuario.name.$touch"
              label="Nome"
            />
          </div>
          <div class="col-12">
            <c-input
              outlined
              :validator="v$.usuario.email"
              @blur="v$.usuario.email.$touch"
              v-model.trim="usuario.email"
              label="E-mail"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <c-input
              outlined
              v-model="usuario.password"
              :validator="v$.usuario.password"
              @blur="v$.usuario.password.$touch"
              :type="isPwd ? 'password' : 'text'"
              label="Senha"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
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
              v-model="usuario.profile"
              :options="optionsProfile"
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
          @click="handleUsuario"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, maxLength } from '@vuelidate/validators'
import { CriarUsuarioTenant } from 'src/service/user'
import { AdminListarEmpresas } from 'src/service/empresas'
import { useStore } from 'vuex'
import { Notify } from 'quasar'

const props = defineProps({
  modalUsuario: {
    type: Boolean,
    default: false
  },
  isProfile: {
    type: Boolean,
    default: false
  },
  usuarioEdicao: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits(['update:usuarioEdicao', 'update:modalUsuario', 'modal-usuario-usuario-editado', 'modal-usuario-usuario-criado'])

const store = useStore()
const tenants = ref([])
const isPwd = ref(false)

const optionsProfile = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuário' }
]

const usuario = reactive({
  name: '',
  email: '',
  password: '',
  profile: 'user',
  tenantId: ''
})

const rules = computed(() => {
  const baseRules = {
    tenantId: { required },
    name: { required, minLength: minLength(3), maxLength: maxLength(50) },
    email: { required, email },
    profile: { required },
    password: {}
  }

  if (!usuario.id) {
    return {
      usuario: {
        ...baseRules,
        password: { required, minLength: minLength(6), maxLength: maxLength(50) }
      }
    }
  }

  return { usuario: baseRules }
})

const v$ = useVuelidate(rules, { usuario })

const filteredTenants = computed(() => tenants.value.map(tenant => ({ 
  label: tenant.name, 
  value: tenant.id 
})))

const carregarEmpresas = async () => {
  const { data } = await AdminListarEmpresas()
  tenants.value = data
}

onMounted(() => {
  carregarEmpresas()
})

const abrirModal = () => {
  if (props.usuarioEdicao.id) {
    Object.assign(usuario, props.usuarioEdicao)
  }
  if (props.usuarioEdicao.userId) {
    Object.assign(usuario, {
      ...props.usuarioEdicao,
      id: props.usuarioEdicao.userId,
      name: props.usuarioEdicao.username,
      profile: props.usuarioEdicao.profile,
      tenantId: props.usuarioEdicao.tenantId
    })
  }
}

const fecharModal = () => {
  if (!props.isProfile) {
    emit('update:usuarioEdicao', {})
  }
  emit('update:modalUsuario', false)
  Object.assign(usuario, {
    name: '',
    email: '',
    password: '',
    profile: 'user',
    tenantId: ''
  })
  isPwd.value = false
  v$.value.$reset()
}

const handleUsuario = async () => {
  v$.value.$touch()
  if (v$.value.$error) {
    return Notify.create({
      type: 'warning',
      progress: true,
      position: 'top',
      message: 'Ops! Verifique os erros...',
      actions: [{
        icon: 'close',
        round: true,
        color: 'white'
      }]
    })
  }

  try {
    if (usuario.id) {
      const {
        email, id, name, tenantId, password, profile
      } = usuario

      const params = { email, id, name, tenantId, password, profile }

      if (store.state.user.isAdmin) {
        params.profile = usuario.profile
      }

      emit('modal-usuario-usuario-editado', params)
      Notify.create({
        type: 'info',
        progress: true,
        position: 'top',
        textColor: 'black',
        message: 'Usuário editado!',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
    } else {
      const { data } = await CriarUsuarioTenant(usuario)
      emit('modal-usuario-usuario-criado', data)
      Notify.create({
        type: 'positive',
        progress: true,
        position: 'top',
        message: 'Usuário criado!',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
    }
    emit('update:modalUsuario', false)
  } catch (error) {
    console.error(error)
    if (error.data?.error === 'ERR_USER_LIMIT_USER_CREATION') {
      Notify.create({
        type: 'negative',
        message: 'Limite de usuario atingido.',
        caption: 'ERR_USER_LIMIT_USER_CREATION',
        position: 'top',
        progress: true
      })
    } else if (error.data?.error === 'ERR_EMAIL_ALREADY_REGISTERED') {
      Notify.create({
        type: 'negative',
        message: 'Este e-mail já está cadastrado.',
        caption: 'ERR_EMAIL_ALREADY_REGISTERED',
        position: 'top',
        progress: true
      })
    } else {
      Notify.create({
        type: 'negative',
        message: 'Não foi possível criar o usuário.',
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
