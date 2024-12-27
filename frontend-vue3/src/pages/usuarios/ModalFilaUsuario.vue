<template>
  <q-dialog
    persistent
    :value="modalFilaUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 400px">
      <q-card-section class="q-pa-none">
        <div class="full-width text-h6 row col bg-grey-4 q-pa-sm">Filas Usuário</div>
        <div
          style="font-size: 1em"
          class="text-caption text-bold row col q-px-sm q-pt-sm"
        >Nome: {{ usuarioSelecionado.name }}</div>
        <div
          style="font-size: 1em"
          class="text-caption text-bold row col q-px-sm"
        >Email: {{ usuarioSelecionado.email }}</div>
        <q-separator spaced />
      </q-card-section>
      <q-card-section>
        <div
          v-for="fila in filas"
          :key="fila.id"
          class="row col"
        >
          <q-checkbox
            :disable="!fila.isActive"
            v-model="filasUsuario"
            :label="`${fila.queue} ${!fila.isActive ? '(Inativo)' : ''}`"
            :val="fila.id"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Sair"
          class="q-px-md q-mr-sm"
          color="negative"
          rounded
          v-close-popup
        />
        <q-btn
          label="Salvar"
          class="q-px-md"
          color="primary"
          rounded
          @click="handleFilaUsuario"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { UpdateUsuarios } from 'src/service/user'
import { Notify } from 'quasar'

const props = defineProps({
  modalFilaUsuario: {
    type: Boolean,
    default: false
  },
  usuarioSelecionado: {
    type: Object,
    default: () => ({ id: null })
  },
  filas: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:usuarioSelecionado', 'update:modalFilaUsuario', 'modal-fila-usuario-sucesso'])

const filasUsuario = ref([])

const abrirModal = () => {
  if (props.usuarioSelecionado.id) {
    filasUsuario.value = [...props.usuarioSelecionado.queues.map(f => f.id)]
  }
}

const fecharModal = () => {
  emit('update:usuarioSelecionado', {})
  emit('update:modalFilaUsuario', false)
}

const handleFilaUsuario = async () => {
  const req = {
    ...props.usuarioSelecionado,
    queues: [...filasUsuario.value]
  }
  
  const { data } = await UpdateUsuarios(req.id, req)
  emit('modal-fila-usuario-sucesso', data)
  
  Notify.create({
    type: 'positive',
    progress: true,
    position: 'top',
    message: 'Filas do usuário editadas com sucesso!',
    actions: [{
      icon: 'close',
      round: true,
      color: 'white'
    }]
  })
  
  fecharModal()
}
</script>

<style lang="scss" scoped>
</style>
