import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
import axios from 'axios'
import { parseISO, startOfDay } from 'date-fns'
import { CriarCampanha, AlterarCampanha } from '../service/campanhas'

export function useCampanhaModal() {
  const $q = useQuasar()
  const store = useStore()

  // Estado
  const loading = ref(false)
  const messagemPreview = ref('message1')
  const arquivos = ref([])
  const abrirModalImagem = ref(false)
  const urlMedia = ref('')

  // Variáveis disponíveis
  const variaveis = [
    { label: 'Nome', value: '{{name}}' },
    { label: 'Saudação', value: '{{greeting}}' }
  ]

  // Opções de preview
  const optRadio = [
    { label: 'Msg.1', value: 'message1' },
    { label: 'Msg. 2', value: 'message2' },
    { label: 'Msg. 3', value: 'message3' }
  ]

  // Template de mensagem
  const messageTemplate = {
    mediaUrl: null,
    id: null,
    ack: 3,
    read: true,
    fromMe: true,
    body: null,
    mediaType: 'chat',
    isDeleted: false,
    createdAt: '2021-02-20T20:09:04.736Z',
    updatedAt: '2021-02-20T23:26:24.311Z',
    quotedMsgId: null,
    delay: 61,
    ticketId: 0,
    contactId: null,
    userId: null,
    contact: null,
    quotedMsg: null
  }

  // Campanha inicial
  const campanha = ref({
    name: null,
    start: null,
    mediaUrl: null,
    message1: null,
    message2: null,
    message3: null,
    sessionId: null,
    delay: 61
  })

  // Computed
  const whatsapps = computed(() => store.getters.whatsapps)

  const sessions = computed(() => 
    whatsapps.value.filter(w => w.type === 'whatsapp' && !w.isDeleted)
  )

  const arquivoName = computed(() => {
    if (!campanha.value.mediaUrl) return ''
    const split = campanha.value.mediaUrl.split('/')
    return split[split.length - 1]
  })

  const messages = computed(() => {
    const messages = []
    const msgArray = ['message1', 'message2', 'message3']

    if (arquivos.value?.type) {
      const blob = new Blob([arquivos.value], { type: arquivos.value.type })
      messages.push({
        ...messageTemplate,
        id: 'mediaUrl',
        mediaUrl: window.URL.createObjectURL(blob),
        body: arquivos.value.name,
        mediaType: arquivos.value.type.substr(0, arquivos.value.type.indexOf('/'))
      })
    } else if (campanha.value.mediaUrl) {
      messages.push({
        ...messageTemplate,
        id: 'mediaUrl',
        mediaUrl: campanha.value.mediaUrl,
        body: '',
        mediaType: campanha.value.mediaType
      })
    }

    msgArray.forEach(el => {
      if (messagemPreview.value === el) {
        const body = campanha.value[el]
        const msg = {
          ...messageTemplate,
          id: el,
          body
        }
        messages.push(msg)
      }
    })

    return messages
  })

  // Métodos
  const resetCampanha = () => {
    campanha.value = {
      id: null,
      name: null,
      start: null,
      message1: null,
      message2: null,
      message3: null,
      mediaUrl: null,
      userId: null,
      delay: 61,
      sessionId: null
    }
    arquivos.value = []
  }

  const isValidDate = (date) => {
    return startOfDay(new Date(parseISO(date))).getTime() >= startOfDay(new Date()).getTime()
  }

  const onRejectedFiles = () => {
    $q.notify({
      html: true,
      message: `Ops... Ocorreu um erro! <br>
      <ul>
        <li>Arquivo deve ter no máximo 10MB.</li>
        <li>Priorize o envio de imagem ou vídeo.</li>
      </ul>`,
      type: 'negative',
      progress: true,
      position: 'top'
    })
  }

  const handleSave = async () => {
    // Validações
    if (campanha.value.message1 === campanha.value.message2 || 
        campanha.value.message1 === campanha.value.message3 || 
        campanha.value.message2 === campanha.value.message3) {
      $q.notify({
        type: 'negative',
        message: 'As mensagens não podem ser iguais'
      })
      return false
    }

    if (campanha.value.delay < 61) {
      $q.notify({
        type: 'negative',
        message: 'O campo delay deve ser no mínimo 61'
      })
      return false
    }

    if (!campanha.value.name || !campanha.value.start || 
        !campanha.value.message1 || !campanha.value.message2 || 
        !campanha.value.message3 || !campanha.value.sessionId) {
      $q.notify({
        type: 'negative',
        message: 'Verifique se todas os campos obrigatórios estão preenchidos'
      })
      return false
    }

    if (!isValidDate(campanha.value.start)) {
      $q.notify({
        type: 'negative',
        message: 'Data de início não pode ser inferior ao dia atual'
      })
      return false
    }

    try {
      loading.value = true
      const medias = new FormData()
      
      Object.keys(campanha.value).forEach((key) => {
        medias.append(key, campanha.value[key])
      })
      medias.append('medias', arquivos.value)

      if (campanha.value.id) {
        const { data } = await AlterarCampanha(medias, campanha.value.id)
        $q.notify({
          type: 'info',
          message: 'Campanha editada!'
        })
        return { success: true, data }
      } else {
        const { data } = await CriarCampanha(medias)
        $q.notify({
          type: 'positive',
          message: 'Campanha criada!'
        })
        return { success: true, data }
      }
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: 'Erro ao salvar campanha'
      })
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  const onInsertEmoji = (emoji, ref) => {
    const tArea = document.querySelector(`#${ref}`)
    if (!tArea || !emoji.data) return

    const startPos = tArea.selectionStart
    const endPos = tArea.selectionEnd
    const text = tArea.value

    const newText = text.substring(0, startPos) + emoji.data + text.substring(endPos)
    campanha.value[ref] = newText

    setTimeout(() => {
      tArea.selectionStart = tArea.selectionEnd = startPos + emoji.data.length
    }, 10)
  }

  const onInsertVariable = (variable, ref) => {
    const tArea = document.querySelector(`#${ref}`)
    if (!tArea || !variable) return

    const startPos = tArea.selectionStart
    const endPos = tArea.selectionEnd
    const text = tArea.value

    const newText = text.substring(0, startPos) + variable + text.substring(endPos)
    campanha.value[ref] = newText

    const newCursorPos = startPos + variable.length
    tArea.setSelectionRange(newCursorPos, newCursorPos)
  }

  return {
    // Estado
    loading,
    messagemPreview,
    arquivos,
    abrirModalImagem,
    urlMedia,
    campanha,
    variaveis,
    optRadio,

    // Computed
    sessions,
    arquivoName,
    messages,

    // Métodos
    resetCampanha,
    onRejectedFiles,
    handleSave,
    onInsertEmoji,
    onInsertVariable
  }
}
