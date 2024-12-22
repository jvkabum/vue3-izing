import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Composable para gerenciar preview de mídia
 * @returns {Object} Objeto contendo estados e métodos do preview
 */
export function useMediaPreview() {
  const $q = useQuasar()
  const sendButton = ref(null)
  const mediaLoaded = ref(false)

  /**
   * Estilo do card baseado no tamanho da tela
   */
  const cardStyle = computed(() => 
    $q.screen.width < 770 
      ? 'height: 90vh; width: 98vw'
      : 'height: 90vh; width: 60vw'
  )

  /**
   * Verifica se é uma imagem
   * @param {Object} media - Objeto de mídia
   */
  const isImage = (media) => 
    media.type?.startsWith('image/') || 
    media.src?.match(/\.(jpg|jpeg|png|gif|webp)$/i)

  /**
   * Verifica se é um vídeo
   * @param {Object} media - Objeto de mídia
   */
  const isVideo = (media) => 
    media.type?.startsWith('video/') || 
    media.src?.match(/\.(mp4|webm|ogg)$/i)

  /**
   * Verifica se é um áudio
   * @param {Object} media - Objeto de mídia
   */
  const isAudio = (media) => 
    media.type?.startsWith('audio/') || 
    media.src?.match(/\.(mp3|wav|ogg)$/i)

  /**
   * Obtém o ícone baseado no tipo de arquivo
   * @param {Object} media - Objeto de mídia
   */
  const getFileIcon = (media) => {
    if (isImage(media)) return 'mdi-file-image'
    if (isVideo(media)) return 'mdi-file-video'
    if (isAudio(media)) return 'mdi-file-music'
    if (media.type?.includes('pdf')) return 'mdi-file-pdf'
    if (media.type?.includes('word')) return 'mdi-file-word'
    if (media.type?.includes('excel')) return 'mdi-file-excel'
    return 'mdi-file-document'
  }

  /**
   * Obtém a cor baseada no tipo de arquivo
   * @param {Object} media - Objeto de mídia
   */
  const getFileColor = (media) => {
    if (isImage(media)) return 'green'
    if (isVideo(media)) return 'red'
    if (isAudio(media)) return 'purple'
    if (media.type?.includes('pdf')) return 'negative'
    if (media.type?.includes('word')) return 'blue'
    if (media.type?.includes('excel')) return 'positive'
    return 'grey'
  }

  /**
   * Manipula exibição do modal
   * @param {Object} media - Objeto de mídia
   */
  const handleShow = (media) => {
    mediaLoaded.value = !isImage(media) && !isVideo(media) && !isAudio(media)
    setTimeout(() => {
      sendButton.value?.$el.focus()
    }, 100)
  }

  /**
   * Manipula fechamento do modal
   */
  const handleHide = () => {
    mediaLoaded.value = false
  }

  /**
   * Manipula carregamento da mídia
   */
  const handleMediaLoad = () => {
    mediaLoaded.value = true
  }

  /**
   * Manipula erro no carregamento da mídia
   */
  const handleMediaError = () => {
    mediaLoaded.value = false
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar mídia',
      position: 'top',
      timeout: 3000
    })
  }

  /**
   * Valida se pode enviar a mídia
   */
  const canSend = computed(() => mediaLoaded.value)

  return {
    // Refs
    sendButton,
    mediaLoaded,

    // Computed
    cardStyle,
    canSend,

    // Métodos
    isImage,
    isVideo,
    isAudio,
    getFileIcon,
    getFileColor,
    handleShow,
    handleHide,
    handleMediaLoad,
    handleMediaError
  }
}
