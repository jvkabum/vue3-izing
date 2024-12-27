<template>
  <q-dialog
    :value="modalChatFlow"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ chatFlow.isDuplicate ? 'Duplicar' : chatFlowEdicao.id ? 'Editar': 'Criar' }} Fluxo <span v-if="chatFlow.isDuplicate"> (Nome: {{ chatFlowEdicao.name }}) </span></div>
        <div
          v-if="chatFlow.isDuplicate"
          class="text-subtitle1"
        > Nome: {{ chatFlowEdicao.name }} </div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          outlined
          rounded
          dense
          v-model="chatFlow.name"
          label="Descrição"
        />
        <div class="row col q-mt-md">
          <q-input
            clearable
            class="full-width"
            rounded
            dense
            outlined
            v-model="chatFlow.celularTeste"
            label="Número para Teste"
            hint="Deixe limpo para que a Auto resposta funcione. Caso contrário, irá funcionar somente para o número informado aqui."
          />
        </div>
        <div class="row col q-mt-md">
          <q-checkbox
            v-model="chatFlow.isActive"
            label="Ativo"
          />
        </div>
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
          @click="handleAutoresposta"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { reactive } from 'vue'
import { useQuasar } from 'quasar'
import { CriarChatFlow, UpdateChatFlow } from 'src/service/chatFlow'
import { getDefaultFlow } from 'src/components/ccFlowBuilder/defaultFlow'

const props = defineProps({
  modalChatFlow: {
    type: Boolean,
    default: false
  },
  chatFlowEdicao: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits([
  'update:modalChatFlow',
  'update:chatFlowEdicao',
  'chat-flow-editado',
  'chat-flow-criada'
])

const userId = +localStorage.getItem('userId')
const $q = useQuasar()

const chatFlow = reactive({
  name: null,
  userId,
  celularTeste: null,
  isActive: true
})

const abrirModal = () => {
  if (props.chatFlowEdicao.id) {
    Object.assign(chatFlow, {
      ...props.chatFlowEdicao,
      userId
    })
  } else {
    Object.assign(chatFlow, {
      name: null,
      action: 0,
      userId,
      celularTeste: null,
      isActive: true
    })
  }
}

const fecharModal = () => {
  Object.assign(chatFlow, {
    name: null,
    action: 0,
    userId,
    celularTeste: null,
    isActive: true
  })
  emit('update:chatFlowEdicao', { id: null })
  emit('update:modalChatFlow', false)
}

const handleAutoresposta = async () => {
  try {
    if (chatFlow.id && !chatFlow?.isDuplicate) {
      const { data } = await UpdateChatFlow(chatFlow)
      $q.notify({
        type: 'positive',
        message: 'Fluxo editado.'
      })
      emit('chat-flow-editado', data)
    } else {
      // setar id = null para rotina de duplicação de fluxo
      const flow = { ...getDefaultFlow(), ...chatFlow, id: null }
      const { data } = await CriarChatFlow(flow)
      $q.notify({
        type: 'positive',
        message: 'Novo fluxo criado.'
      })
      emit('chat-flow-criada', data)
    }
    fecharModal()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar o fluxo',
      caption: error.message
    })
  }
}
</script>

<style lang="scss" scoped>
</style>
