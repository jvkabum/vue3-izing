import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { ListarContatos } from 'src/service/contatos'
import { EnviarMensagem } from 'src/service/tickets'

export function useForward() {
  const $q = useQuasar()
  const store = useStore()
  const loading = ref(false)

  const contatos = ref([])
  const contatoSelecionado = ref(null)
  const modalEncaminhar = ref(false)
  const mensagensParaEncaminhar = ref([])
  const ativarMultiEncaminhamento = ref(false)

  const contatosFiltrados = computed(() => {
    return contatos.value.filter(contato => contato.isActive)
  })

  const carregarContatos = async (search = '') => {
    loading.value = true
    try {
      const { data } = await ListarContatos({
        searchParam: search
      })
      contatos.value = data.contacts
    } catch (error) {
      console.error('Erro ao carregar contatos:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar contatos',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const encaminharMensagem = async (mensagem) => {
    if (!contatoSelecionado.value) {
      $q.notify({
        type: 'warning',
        message: 'Selecione um contato para encaminhar'
      })
      return
    }

    loading.value = true
    try {
      const mensagens = mensagem ? [mensagem] : mensagensParaEncaminhar.value

      for (const msg of mensagens) {
        const formData = new FormData()
        
        if (msg.mediaUrl) {
          const response = await fetch(msg.mediaUrl)
          const blob = await response.blob()
          formData.append('medias', blob, msg.mediaName || 'file')
        }

        formData.append('body', msg.body)
        formData.append('contactId', contatoSelecionado.value.id)
        formData.append('fromMe', true)
        formData.append('quotedMsg', msg.quotedMsg ? JSON.stringify(msg.quotedMsg) : '')

        await EnviarMensagem(formData)
      }

      $q.notify({
        type: 'positive',
        message: 'Mensagem(ns) encaminhada(s) com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalEncaminhar.value = false
      mensagensParaEncaminhar.value = []
      ativarMultiEncaminhamento.value = false
      contatoSelecionado.value = null

    } catch (error) {
      console.error('Erro ao encaminhar mensagem:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao encaminhar mensagem',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const abrirModalEncaminhar = (mensagem = null) => {
    if (mensagem) {
      mensagensParaEncaminhar.value = [mensagem]
    }
    modalEncaminhar.value = true
    carregarContatos()
  }

  const fecharModalEncaminhar = () => {
    modalEncaminhar.value = false
    mensagensParaEncaminhar.value = []
    ativarMultiEncaminhamento.value = false
    contatoSelecionado.value = null
  }

  const toggleMultiEncaminhamento = () => {
    ativarMultiEncaminhamento.value = !ativarMultiEncaminhamento.value
    if (!ativarMultiEncaminhamento.value) {
      mensagensParaEncaminhar.value = []
    }
  }

  const adicionarMensagemParaEncaminhar = (mensagem) => {
    if (mensagensParaEncaminhar.value.length >= 10) {
      $q.notify({
        type: 'warning',
        message: 'Limite máximo de 10 mensagens atingido'
      })
      return
    }

    const index = mensagensParaEncaminhar.value.findIndex(m => m.id === mensagem.id)
    if (index === -1) {
      mensagensParaEncaminhar.value.push(mensagem)
    }
  }

  const removerMensagemParaEncaminhar = (mensagem) => {
    const index = mensagensParaEncaminhar.value.findIndex(m => m.id === mensagem.id)
    if (index !== -1) {
      mensagensParaEncaminhar.value.splice(index, 1)
    }
  }

  const localizarContato = async (search, update, abort) => {
    if (search.length < 2) {
      abort()
      return
    }

    loading.value = true
    try {
      const { data } = await ListarContatos({
        searchParam: search
      })
      update(() => {
        contatos.value = data.contacts
      })
    } catch (error) {
      console.error('Erro ao localizar contato:', error)
      abort()
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    contatos,
    contatosFiltrados,
    contatoSelecionado,
    modalEncaminhar,
    mensagensParaEncaminhar,
    ativarMultiEncaminhamento,
    carregarContatos,
    encaminharMensagem,
    abrirModalEncaminhar,
    fecharModalEncaminhar,
    toggleMultiEncaminhamento,
    adicionarMensagemParaEncaminhar,
    removerMensagemParaEncaminhar,
    localizarContato
  }
}
