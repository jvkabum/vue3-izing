import { ref } from 'vue'

export function useMediaHandler() {
  // Controla a visibilidade do preview de mídia
  const isMediaPreviewVisible = ref(false)
  // Armazena a URL da mídia atual
  const currentMediaUrl = ref('')
  // Armazena o tipo da mídia atual
  const currentMediaType = ref('')

  /**
   * Abre a mídia em uma nova aba ou mostra preview
   * @param {Object} mensagem - Objeto da mensagem contendo mediaUrl e mediaType
   */
  const handleMediaClick = (mensagem) => {
    if (!mensagem.mediaUrl) return

    // Se for imagem, mostra preview
    if (mensagem.mediaType === 'image') {
      currentMediaUrl.value = mensagem.mediaUrl
      currentMediaType.value = mensagem.mediaType
      isMediaPreviewVisible.value = true
      return
    }

    // Para outros tipos de mídia, abre em nova aba
    window.open(mensagem.mediaUrl, '_blank')
  }

  /**
   * Fecha o preview de mídia
   */
  const closeMediaPreview = () => {
    isMediaPreviewVisible.value = false
    currentMediaUrl.value = ''
    currentMediaType.value = ''
  }

  /**
   * Verifica se a mídia é uma imagem
   * @param {string} mediaType - Tipo da mídia
   * @returns {boolean}
   */
  const isImage = (mediaType) => {
    return mediaType === 'image'
  }

  /**
   * Verifica se a mídia é um vídeo
   * @param {string} mediaType - Tipo da mídia
   * @returns {boolean}
   */
  const isVideo = (mediaType) => {
    return mediaType === 'video'
  }

  /**
   * Verifica se a mídia é um áudio
   * @param {string} mediaType - Tipo da mídia
   * @returns {boolean}
   */
  const isAudio = (mediaType) => {
    return mediaType === 'audio' || mediaType === 'ptt'
  }

  return {
    isMediaPreviewVisible,
    currentMediaUrl,
    currentMediaType,
    handleMediaClick,
    closeMediaPreview,
    isImage,
    isVideo,
    isAudio
  }
}
