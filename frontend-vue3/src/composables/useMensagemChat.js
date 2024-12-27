import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import axios from 'axios'
import { api } from 'src/boot/axios'
import { Base64 } from 'js-base64'

const downloadImageCors = axios.create({
  baseURL: process.env.VUE_URL_API,
  timeout: 20000,
  headers: {
    responseType: 'blob'
  }
})

export function useMensagemChat() {
  const $q = useQuasar()
  const store = useStore()

  const modalContato = ref(false)
  const currentContact = ref({})
  const mensagemAtual = ref({ body: '' })
  const showModaledit = ref(false)
  const abrirModalImagem = ref(false)
  const urlMedia = ref('')
  const identificarMensagem = ref(null)
  const loading = ref(false)

  const ackIcons = {
    0: 'mdi-clock-outline',
    1: 'mdi-check',
    2: 'mdi-check-all',
    3: 'mdi-check-all',
    4: 'mdi-check-all'
  }

  const openContactModal = (contact) => {
    currentContact.value = contact
    modalContato.value = true
  }

  const closeModal = () => {
    modalContato.value = false
  }

  const saveContact = async (contact) => {
    try {
      loading.value = true
      const { data } = await api.post('/contacts', contact)
      $q.notify({
        type: 'positive',
        message: 'Contato salvo com sucesso',
        position: 'top'
      })
      return data
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao salvar contato',
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const salvarMensagem = async () => {
    try {
      loading.value = true
      const { data } = await api.put(`/messages/${mensagemAtual.value.id}`, {
        messageId: mensagemAtual.value.messageId,
        body: mensagemAtual.value.body
      })
      showModaledit.value = false
      $q.notify({
        type: 'positive',
        message: 'Mensagem editada com sucesso',
        position: 'top'
      })
      return data
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao editar mensagem',
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const abrirModalEditarMensagem = (mensagem) => {
    mensagemAtual.value = mensagem
    showModaledit.value = true
  }

  const verificarEncaminharMensagem = (mensagem, mensagensParaEncaminhar, refs) => {
    const mensagens = [...mensagensParaEncaminhar]
    const msgIdx = mensagens.findIndex(m => m.id === mensagem.id)
    if (msgIdx !== -1) {
      mensagens.splice(msgIdx, 1)
    } else {
      if (mensagensParaEncaminhar.length > 9) {
        throw new Error('Permitido no máximo 10 mensagens.')
      }
      mensagens.push(mensagem)
    }
    refs[`box-chat-message-${mensagem.id}`][0].value = !refs[`box-chat-message-${mensagem.id}`][0].value
    return mensagens
  }

  const isPDF = (url) => {
    if (!url) return false
    const split = url.split('.')
    const ext = split[split.length - 1]
    return ext === 'pdf'
  }

  const isGroupLabel = (mensagem, ticketFocado) => {
    try {
      return ticketFocado.isGroup ? mensagem.contact.name : ''
    } catch (error) {
      return ''
    }
  }

  const returnCardContato = (str) => {
    return Base64.encode(str)
  }

  const isDesactivatDelete = (msg) => {
    return false
  }

  const buscarImageCors = async (imageUrl) => {
    loading.value = true
    try {
      const { data, headers } = await downloadImageCors.get(imageUrl, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(
        new Blob([data], { type: headers['content-type'] })
      )
      urlMedia.value = url
      abrirModalImagem.value = true
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar imagem',
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const deletarMensagem = async (mensagem) => {
    if (isDesactivatDelete(mensagem)) {
      throw new Error('Não foi possível apagar mensagem com mais de 5min do envio.')
    }

    try {
      await $q.dialog({
        title: 'Atenção!! Deseja realmente deletar a mensagem? ',
        message: 'Mensagens antigas não serão apagadas no cliente.',
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
      await api.delete(`/messages/${mensagem.id}`)
      $q.notify({
        type: 'positive',
        message: 'Mensagem deletada com sucesso',
        position: 'top'
      })
      loading.value = false
      return true
    } catch (error) {
      loading.value = false
      if (error === false) return false // Dialog cancelled
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar mensagem',
        position: 'top'
      })
      throw error
    }
  }

  const focarMensagem = (mensagem) => {
    const id = `chat-message-${mensagem.id}`
    identificarMensagem.value = id
    setTimeout(() => {
      const elem = document.getElementById(id)
      if (elem) elem.scrollIntoView()
    })
    setTimeout(() => {
      identificarMensagem.value = null
    }, 5000)
  }

  return {
    modalContato,
    currentContact,
    mensagemAtual,
    showModaledit,
    abrirModalImagem,
    urlMedia,
    identificarMensagem,
    loading,
    ackIcons,
    openContactModal,
    closeModal,
    saveContact,
    salvarMensagem,
    abrirModalEditarMensagem,
    verificarEncaminharMensagem,
    isPDF,
    isGroupLabel,
    returnCardContato,
    isDesactivatDelete,
    buscarImageCors,
    deletarMensagem,
    focarMensagem
  }
}
