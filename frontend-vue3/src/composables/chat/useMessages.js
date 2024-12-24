import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/service/api'
import { useSocket } from '@/composables/integracoes/useSocket'

export function useMensagens(ticketId) {
  const $q = useQuasar()
  const { socket } = useSocket()

  // Estado
  const mensagens = ref([])
  const carregando = ref(false)
  const temMais = ref(true)
  const numeroPagina = ref(1)
  const erro = ref(null)

  // Computed Properties
  const mensagensOrdenadas = computed(() => {
    return [...mensagens.value].sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt)
    })
  })

  const mensagensNaoLidas = computed(() => 
    mensagens.value.filter(m => !m.read)
  )

  // Métodos
  const buscarMensagens = async () => {
    if (carregando.value || !temMais.value) return

    try {
      carregando.value = true
      erro.value = null

      const { data } = await api.get(`/messages/${ticketId}`, {
        params: {
          pageNumber: numeroPagina.value
        }
      })
      
      mensagens.value = [...mensagens.value, ...data.messages]
      temMais.value = data.hasMore
      numeroPagina.value++
      return data
    } catch (err) {
      erro.value = 'Erro ao carregar mensagens'
      console.error('Erro ao carregar mensagens:', err)
      throw err
    } finally {
      carregando.value = false
    }
  }

  const enviarMensagem = async (mensagem) => {
    try {
      carregando.value = true
      erro.value = null

      const { data } = await api.post(`/messages/${ticketId}`, mensagem)
      mensagens.value.push(data)
      return data
    } catch (err) {
      erro.value = 'Erro ao enviar mensagem'
      console.error('Erro ao enviar mensagem:', err)
      throw err
    } finally {
      carregando.value = false
    }
  }

  const marcarComoLida = async (mensagemId) => {
    try {
      const { data } = await api.put(`/messages/${mensagemId}/read`)
      const mensagem = mensagens.value.find(m => m.id === mensagemId)
      if (mensagem) {
        mensagem.read = true
      }
      return data
    } catch (err) {
      console.error('Erro ao marcar mensagem como lida:', err)
      throw err
    }
  }

  const deletarMensagem = async (mensagemId) => {
    try {
      carregando.value = true
      erro.value = null

      await api.delete(`/messages/${mensagemId}`)
      mensagens.value = mensagens.value.filter(m => m.id !== mensagemId)
      return true
    } catch (err) {
      erro.value = 'Erro ao deletar mensagem'
      console.error('Erro ao deletar mensagem:', err)
      throw err
    } finally {
      carregando.value = false
    }
  }

  // Socket handlers
  const handleNovaMensagem = (data) => {
    if (data.ticketId === ticketId) {
      mensagens.value.push(data)
    }
  }

  const handleMensagemDeletada = (mensagemId) => {
    mensagens.value = mensagens.value.filter(m => m.id !== mensagemId)
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('message', handleNovaMensagem)
    socket.value?.on('messageDelete', handleMensagemDeletada)
  }

  const removeSocketListeners = () => {
    socket.value?.off('message', handleNovaMensagem)
    socket.value?.off('messageDelete', handleMensagemDeletada)
  }

  // Lifecycle hooks
  onMounted(() => {
    setupSocketListeners()
    buscarMensagens()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    mensagens: mensagensOrdenadas,
    carregando,
    temMais,
    erro,

    // Computed
    mensagensNaoLidas,

    // Métodos
    buscarMensagens,
    enviarMensagem,
    marcarComoLida,
    deletarMensagem
  }
}
