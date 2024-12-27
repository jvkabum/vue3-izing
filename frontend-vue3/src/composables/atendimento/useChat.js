import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { EnviarMensagem } from 'src/service/chat'

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
      const { data } = await EnviarMensagem(ticketId)
      mensagens.value = data.messages
      store.commit('SET_MESSAGES', data.messages)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar mensagens',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const enviarMensagem = async (mensagem) => {
    loading.value = true
    try {
      const { data } = await EnviarMensagem(mensagem)
      mensagens.value.push(data)
      store.commit('ADD_MESSAGE', data)

      $q.notify({
        type: 'positive',
        message: 'Mensagem enviada com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalChat.value = false
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao enviar mensagem',
        caption: error.message
      })
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

  return {
    loading,
    mensagens,
    mensagemSelecionada,
    modalChat,
    carregarMensagens,
    enviarMensagem,
    abrirModalChat,
    fecharModalChat
  }
}
