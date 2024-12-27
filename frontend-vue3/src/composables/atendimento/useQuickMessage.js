import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { ListarMensagensRapidas, CriarMensagemRapida, AtualizarMensagemRapida, DeletarMensagemRapida } from 'src/service/quickMessages'

export function useQuickMessage() {
  const $q = useQuasar()
  const store = useStore()
  const loading = ref(false)

  const mensagensRapidas = ref([])
  const mensagemRapidaSelecionada = ref(null)
  const modalMensagemRapida = ref(false)

  const mensagensRapidasAtivas = computed(() => {
    return mensagensRapidas.value.filter(msg => msg.isActive)
  })

  const carregarMensagensRapidas = async () => {
    loading.value = true
    try {
      const { data } = await ListarMensagensRapidas()
      mensagensRapidas.value = data
      store.commit('SET_QUICK_MESSAGES', data)
    } catch (error) {
      console.error('Erro ao carregar mensagens rápidas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar mensagens rápidas',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const criarMensagemRapida = async (mensagem) => {
    loading.value = true
    try {
      const { data } = await CriarMensagemRapida(mensagem)
      
      mensagensRapidas.value.push(data)
      store.commit('ADD_QUICK_MESSAGE', data)

      $q.notify({
        type: 'positive',
        message: 'Mensagem rápida criada com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalMensagemRapida.value = false
    } catch (error) {
      console.error('Erro ao criar mensagem rápida:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar mensagem rápida',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const atualizarMensagemRapida = async (mensagem) => {
    loading.value = true
    try {
      const { data } = await AtualizarMensagemRapida(mensagem.id, mensagem)
      
      const index = mensagensRapidas.value.findIndex(m => m.id === mensagem.id)
      if (index !== -1) {
        mensagensRapidas.value[index] = data
      }

      store.commit('UPDATE_QUICK_MESSAGE', data)

      $q.notify({
        type: 'positive',
        message: 'Mensagem rápida atualizada com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalMensagemRapida.value = false
    } catch (error) {
      console.error('Erro ao atualizar mensagem rápida:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar mensagem rápida',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const deletarMensagemRapida = async (mensagemId) => {
    try {
      await $q.dialog({
        title: 'Confirmar exclusão',
        message: 'Tem certeza que deseja excluir esta mensagem rápida?',
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
      await DeletarMensagemRapida(mensagemId)
      
      mensagensRapidas.value = mensagensRapidas.value.filter(m => m.id !== mensagemId)
      store.commit('DELETE_QUICK_MESSAGE', mensagemId)

      $q.notify({
        type: 'positive',
        message: 'Mensagem rápida excluída com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      if (error === false) return // Dialog cancelled
      
      console.error('Erro ao deletar mensagem rápida:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar mensagem rápida',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const abrirModalMensagemRapida = (mensagem = null) => {
    mensagemRapidaSelecionada.value = mensagem
    modalMensagemRapida.value = true
  }

  const fecharModalMensagemRapida = () => {
    mensagemRapidaSelecionada.value = null
    modalMensagemRapida.value = false
  }

  const salvarMensagemRapida = async (mensagem) => {
    if (mensagem.id) {
      await atualizarMensagemRapida(mensagem)
    } else {
      await criarMensagemRapida(mensagem)
    }
  }

  const buscarMensagemRapida = (shortcut) => {
    if (!shortcut) return null
    
    shortcut = shortcut.toLowerCase().replace('/', '')
    return mensagensRapidas.value.find(msg => 
      msg.key.toLowerCase() === shortcut
    )
  }

  return {
    loading,
    mensagensRapidas,
    mensagensRapidasAtivas,
    mensagemRapidaSelecionada,
    modalMensagemRapida,
    carregarMensagensRapidas,
    criarMensagemRapida,
    atualizarMensagemRapida,
    deletarMensagemRapida,
    abrirModalMensagemRapida,
    fecharModalMensagemRapida,
    salvarMensagemRapida,
    buscarMensagemRapida
  }
}
