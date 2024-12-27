<template>
  <q-dialog
    :modelValue="modalAutoResposta"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ autoRespostaEdicao.id ? 'Editar': 'Criar' }} Auto Resposta</div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          v-model="autoResposta.name"
          label="Descrição"
        />
        <div class="row col q-mt-md">
          <q-checkbox
            v-model="autoResposta.isActive"
            label="Ativo"
          />
        </div>
        <div class="row col q-mt-md">
          <q-input
            clearable
            class="full-width"
            square
            outlined
            v-model="autoResposta.celularTeste"
            label="Número para Teste"
            hint="Deixe limpo para que a Auto resposta funcione. Caso contrário, irá funcionar somente para o número informado aqui."
          />
        </div>
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
          @click="handleAutoresposta"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { CriarAutoResposta, EditarAutoResposta } from 'src/service/autoResposta'

const userId = +localStorage.getItem('userId')

export default defineComponent({
  name: 'ModalAutoResposta',
  props: {
    modalAutoResposta: {
      type: Boolean,
      default: false
    },
    autoRespostaEdicao: {
      type: Object,
      default: () => ({ id: null })
    }
  },
  emits: ['update:modalAutoResposta', 'update:autoRespostaEdicao', 'auto-resposta-editado', 'auto-resposta-criada'],
  setup(props, { emit }) {
    const $q = useQuasar()

    const autoResposta = reactive({
      name: null,
      action: 0,
      userId,
      celularTeste: null,
      isActive: true
    })

    const resetAutoResposta = () => {
      Object.assign(autoResposta, {
        name: null,
        action: 0,
        userId,
        celularTeste: null,
        isActive: true
      })
    }

    const abrirModal = () => {
      if (props.autoRespostaEdicao.id) {
        Object.assign(autoResposta, {
          ...props.autoRespostaEdicao,
          userId
        })
      } else {
        resetAutoResposta()
      }
    }

    const fecharModal = () => {
      resetAutoResposta()
      emit('update:autoRespostaEdicao', { id: null })
      emit('update:modalAutoResposta', false)
    }

    const handleAutoresposta = async () => {
      try {
        if (autoResposta.id) {
          const { data } = await EditarAutoResposta(autoResposta)
          emit('auto-resposta-editado', data)
          $q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            message: 'Auto resposta editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarAutoResposta(autoResposta)
          emit('auto-resposta-criada', data)
          $q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Auto resposta criada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        fecharModal()
      } catch (error) {
        console.error(error)
        $q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          message: 'Ocorreu um erro!',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
    }

    return {
      autoResposta,
      abrirModal,
      fecharModal,
      handleAutoresposta
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
