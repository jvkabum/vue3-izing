<template>
  <q-dialog
    persistent
    :modelValue="modalTenant"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ tenantEdicao.id ? 'Editar': 'Criar' }} Tenant</div>
      </q-card-section>
      <q-card-section>
        <q-toggle
          v-model="toggleStatus"
          :label="toggleStatus ? 'Ativo' : 'Inativo'"
          color="primary"
        />
        <q-input
          class="row col"
          square
          outlined
          v-model="tenant.name"
          label="Nome"
        />
        <q-input
          class="row col"
          square
          outlined
          type="number"
          v-model="tenant.maxUsers"
          label="Usuários"
        />
        <q-input
          class="row col"
          square
          outlined
          type="number"
          v-model="tenant.maxConnections"
          label="Conexões"
        />
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          label="Salvar"
          color="primary"
          @click="validateAndHandleTenant"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import { CriarTenant, AlterarTenant } from 'src/service/empresas'

export default defineComponent({
  name: 'ModalTenant',
  props: {
    modalTenant: {
      type: Boolean,
      default: false
    },
    tenantEdicao: {
      type: Object,
      default: () => ({ id: null })
    }
  },
  emits: ['update:modalTenant', 'update:tenantEdicao', 'modal-tenant-editada', 'modal-tenant-criada'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const loading = ref(false)
    const toggleStatus = ref(false)
    
    const tenant = reactive({
      id: null,
      status: 'active',
      name: null,
      maxUsers: null,
      maxConnections: null,
      bmToken: null
    })

    const resetarTenant = () => {
      Object.assign(tenant, {
        id: null,
        status: null,
        name: null,
        maxUsers: null,
        maxConnections: null,
        bmToken: null
      })
    }

    const fecharModal = () => {
      resetarTenant()
      emit('update:tenantEdicao', { id: null })
      emit('update:modalTenant', false)
    }

    const abrirModal = () => {
      if (props.tenantEdicao.id) {
        Object.assign(tenant, props.tenantEdicao)
      } else {
        resetarTenant()
      }
    }

    const notificarErro = (message, error) => {
      console.error(error)
      $q.notify({
        type: 'negative',
        progress: true,
        position: 'top',
        message,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
    }

    const handleTenant = async () => {
      try {
        loading.value = true
        if (tenant.id) {
          const { data } = await AlterarTenant(tenant)
          emit('modal-tenant-editada', data)
          $q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Empresa editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarTenant(tenant)
          emit('modal-tenant-criada', data)
          $q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Empresa criada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        loading.value = false
        fecharModal()
      } catch (error) {
        notificarErro('Ocorreu um erro ao criar a Empresa', error)
      }
    }

    const areRequiredFieldsFilled = () => 
      tenant.name &&
      tenant.maxUsers !== null &&
      tenant.maxConnections !== null &&
      tenant.status !== null

    const validateAndHandleTenant = () => {
      if (areRequiredFieldsFilled()) {
        handleTenant()
      } else {
        $q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          message: 'Preencha todos os campos obrigatórios!',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
    }

    // Watchers
    watch(() => tenant.status, newStatus => {
      toggleStatus.value = newStatus === 'active'
    })

    watch(toggleStatus, newToggleStatus => {
      tenant.status = newToggleStatus ? 'active' : 'inactive'
    })

    return {
      tenant,
      loading,
      toggleStatus,
      fecharModal,
      abrirModal,
      validateAndHandleTenant
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
