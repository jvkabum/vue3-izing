import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { api } from 'src/boot/axios'

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
      const { data } = await api.get('/auto-replies')
      autoRespostas.value = data
      store.commit('SET_AUTO_REPLIES', data)
      return data
    } catch (error) {
      console.error('Erro ao carregar auto respostas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar auto respostas',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const criarAutoResposta = async (autoResposta) => {
    loading.value = true
    try {
      const { data } = await api.post('/auto-replies', autoResposta)
      
      autoRespostas.value.push(data)
      store.commit('ADD_AUTO_REPLY', data)

      $q.notify({
        type: 'positive',
        message: 'Auto resposta criada com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalAutoResposta.value = false
      return data
    } catch (error) {
      console.error('Erro ao criar auto resposta:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar auto resposta',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const atualizarAutoResposta = async (autoResposta) => {
    loading.value = true
    try {
      const { data } = await api.put(`/auto-replies/${autoResposta.id}`, autoResposta)
      
      const index = autoRespostas.value.findIndex(r => r.id === autoResposta.id)
      if (index !== -1) {
        autoRespostas.value[index] = data
      }

      store.commit('UPDATE_AUTO_REPLY', data)

      $q.notify({
        type: 'positive',
        message: 'Auto resposta atualizada com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalAutoResposta.value = false
      return data
    } catch (error) {
      console.error('Erro ao atualizar auto resposta:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar auto resposta',
        caption: error.message,
        position: 'top'
      })
      throw error
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
      await api.delete(`/auto-replies/${autoRespostaId}`)
      
      autoRespostas.value = autoRespostas.value.filter(r => r.id !== autoRespostaId)
      store.commit('DELETE_AUTO_REPLY', autoRespostaId)

      $q.notify({
        type: 'positive',
        message: 'Auto resposta excluída com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      if (error === false) return // Dialog cancelled
      
      console.error('Erro ao deletar auto resposta:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar auto resposta',
        caption: error.message,
        position: 'top'
      })
      throw error
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
      return await atualizarAutoResposta(autoResposta)
    } else {
      return await criarAutoResposta(autoResposta)
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
