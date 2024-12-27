import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { ListarAutoRespostas, CriarAutoResposta, AtualizarAutoResposta, DeletarAutoResposta } from 'src/service/autoReplies'

export function useAutoReply() {
  const $q = useQuasar()
  const store = useStore()
  const loading = ref(false)

  const autoRespostas = ref([])
  const autoRespostaSelecionada = ref(null)
  const modalAutoResposta = ref(false)
  const etapaSelecionada = ref(null)
  const modalEtapa = ref(false)

  const autoRespostasAtivas = computed(() => {
    return autoRespostas.value.filter(reply => reply.isActive)
  })

  const carregarAutoRespostas = async () => {
    loading.value = true
    try {
      const { data } = await ListarAutoRespostas()
      autoRespostas.value = data
      store.commit('SET_AUTO_REPLIES', data)
    } catch (error) {
      console.error('Erro ao carregar auto respostas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar auto respostas',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const criarAutoResposta = async (autoResposta) => {
    loading.value = true
    try {
      const { data } = await CriarAutoResposta(autoResposta)
      
      autoRespostas.value.push(data)
      store.commit('ADD_AUTO_REPLY', data)

      $q.notify({
        type: 'positive',
        message: 'Auto resposta criada com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalAutoResposta.value = false
    } catch (error) {
      console.error('Erro ao criar auto resposta:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar auto resposta',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const atualizarAutoResposta = async (autoResposta) => {
    loading.value = true
    try {
      const { data } = await AtualizarAutoResposta(autoResposta.id, autoResposta)
      
      const index = autoRespostas.value.findIndex(r => r.id === autoResposta.id)
      if (index !== -1) {
        autoRespostas.value[index] = data
      }

      store.commit('UPDATE_AUTO_REPLY', data)

      $q.notify({
        type: 'positive',
        message: 'Auto resposta atualizada com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalAutoResposta.value = false
    } catch (error) {
      console.error('Erro ao atualizar auto resposta:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar auto resposta',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const deletarAutoResposta = async (autoRespostaId) => {
    try {
      await $q.dialog({
        title: 'Confirmar exclusão',
        message: 'Tem certeza que deseja excluir esta auto resposta?',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      })

      loading.value = true
      await DeletarAutoResposta(autoRespostaId)
      
      autoRespostas.value = autoRespostas.value.filter(r => r.id !== autoRespostaId)
      store.commit('DELETE_AUTO_REPLY', autoRespostaId)

      $q.notify({
        type: 'positive',
        message: 'Auto resposta excluída com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      if (error === false) return // Dialog cancelled
      
      console.error('Erro ao deletar auto resposta:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar auto resposta',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const abrirModalAutoResposta = (autoResposta = null) => {
    autoRespostaSelecionada.value = autoResposta
    modalAutoResposta.value = true
  }

  const fecharModalAutoResposta = () => {
    autoRespostaSelecionada.value = null
    modalAutoResposta.value = false
  }

  const abrirModalEtapa = (etapa = null, autoResposta = null) => {
    etapaSelecionada.value = etapa
    autoRespostaSelecionada.value = autoResposta
    modalEtapa.value = true
  }

  const fecharModalEtapa = () => {
    etapaSelecionada.value = null
    autoRespostaSelecionada.value = null
    modalEtapa.value = false
  }

  const salvarAutoResposta = async (autoResposta) => {
    if (autoResposta.id) {
      await atualizarAutoResposta(autoResposta)
    } else {
      await criarAutoResposta(autoResposta)
    }
  }

  const adicionarEtapa = (autoResposta, etapa) => {
    if (!autoResposta.steps) {
      autoResposta.steps = []
    }
    autoResposta.steps.push(etapa)
  }

  const removerEtapa = (autoResposta, etapaIndex) => {
    autoResposta.steps.splice(etapaIndex, 1)
  }

  const moverEtapa = (autoResposta, fromIndex, toIndex) => {
    const etapa = autoResposta.steps[fromIndex]
    autoResposta.steps.splice(fromIndex, 1)
    autoResposta.steps.splice(toIndex, 0, etapa)
  }

  return {
    loading,
    autoRespostas,
    autoRespostasAtivas,
    autoRespostaSelecionada,
    modalAutoResposta,
    etapaSelecionada,
    modalEtapa,
    carregarAutoRespostas,
    criarAutoResposta,
    atualizarAutoResposta,
    deletarAutoResposta,
    abrirModalAutoResposta,
    fecharModalAutoResposta,
    abrirModalEtapa,
    fecharModalEtapa,
    salvarAutoResposta,
    adicionarEtapa,
    removerEtapa,
    moverEtapa
  }
}
