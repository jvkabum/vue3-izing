<template>
  <q-dialog
    persistent
    :modelValue="modalFila"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <div class="text-h6">{{ filaEdicao.id ? 'Editar': 'Criar' }} Fila</div>
      <q-card-section>
        <q-input
          class="row col"
          rounded
          outlined
          dense
          v-model="fila.queue"
          label="Nome da Fila"
        />
        <q-checkbox
          v-model="fila.isActive"
          label="Ativo"
        />
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          rounded
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          rounded
          label="Salvar"
          color="positive"
          @click="handleFila"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { CriarFila, AlterarFila } from 'src/service/filas'

export default defineComponent({
  name: 'ModalFila',
  props: {
    modalFila: {
      type: Boolean,
      default: false
    },
    filaEdicao: {
      type: Object,
      default: () => ({ id: null })
    }
  },
  emits: ['update:modalFila', 'update:filaEdicao', 'modal-fila-editada', 'modal-fila-criada'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const loading = ref(false)

    const fila = reactive({
      id: null,
      queue: null,
      isActive: true
    })

    const resetarFila = () => {
      Object.assign(fila, {
        id: null,
        queue: null,
        isActive: true
      })
    }

    const fecharModal = () => {
      resetarFila()
      emit('update:filaEdicao', { id: null })
      emit('update:modalFila', false)
    }

    const abrirModal = () => {
      if (props.filaEdicao.id) {
        Object.assign(fila, props.filaEdicao)
      } else {
        resetarFila()
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

    const handleFila = async () => {
      try {
        loading.value = true
        if (fila.id) {
          const { data } = await AlterarFila(fila)
          emit('modal-fila-editada', data)
          $q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Etapa editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarFila(fila)
          emit('modal-fila-criada', data)
          $q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Fila criada!',
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
        notificarErro('Ocorreu um erro!', error)
      }
    }

    return {
      fila,
      loading,
      fecharModal,
      abrirModal,
      handleFila
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
