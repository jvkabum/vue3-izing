import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { api } from 'src/boot/axios'

export function useChat() {
  const $q = useQuasar()
  const store = useStore()
  const loading = ref(false)

  const mensagens = ref([])
  const mensagemSelecionada = ref(null)
  const modalChat = ref(false)

  const carregarMensagens = async (ticketId) => {
    loading.value = true
    try {
      const { data } = await api.get(`/messages/${ticketId}`)
      mensagens.value = data.messages
      store.commit('SET_MESSAGES', data.messages)
      return data.messages
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar mensagens',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const enviarMensagem = async (ticketId, mensagem) => {
    loading.value = true
    try {
      const { data } = await api.post(`/messages/${ticketId}`, mensagem)
      mensagens.value.push(data)
      store.commit('ADD_MESSAGE', data)

      $q.notify({
        type: 'positive',
        message: 'Mensagem enviada com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalChat.value = false
      return data
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao enviar mensagem',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const abrirModalChat = (mensagem = null) => {
    mensagemSelecionada.value = mensagem
    modalChat.value = true
  }

  const fecharModalChat = () => {
    mensagemSelecionada.value = null
    modalChat.value = false
  }

  const marcarComoLida = async (mensagemId) => {
    try {
      const { data } = await api.put(`/messages/${mensagemId}/read`)
      const index = mensagens.value.findIndex(m => m.id === mensagemId)
      if (index !== -1) {
        mensagens.value[index] = data
        store.commit('UPDATE_MESSAGE', data)
      }
      return data
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao marcar mensagem como lida',
        caption: error.message,
        position: 'top'
      })
      throw error
    }
  }

  const deletarMensagem = async (mensagemId) => {
    try {
      await $q.dialog({
        title: 'Confirmar exclusão',
        message: 'Tem certeza que deseja excluir esta mensagem?',
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

      await api.delete(`/messages/${mensagemId}`)
      mensagens.value = mensagens.value.filter(m => m.id !== mensagemId)
      store.commit('DELETE_MESSAGE', mensagemId)

      $q.notify({
        type: 'positive',
        message: 'Mensagem excluída com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      if (error === false) return // Dialog cancelled
      
      console.error('Erro ao deletar mensagem:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar mensagem',
        caption: error.message,
        position: 'top'
      })
      throw error
    }
  }

  return {
    loading,
    mensagens,
    mensagemSelecionada,
    modalChat,
    carregarMensagens,
    enviarMensagem,
    abrirModalChat,
    fecharModalChat,
    marcarComoLida,
    deletarMensagem
  }
}
