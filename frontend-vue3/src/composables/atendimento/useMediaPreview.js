import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

export function useMediaPreview() {
  const $q = useQuasar()
  const state = ref({
    isOpen: false,
    currentMedia: null
  })

  const isImage = computed(() => {
    if (!state.value.currentMedia) return false
    return state.value.currentMedia.type === 'image'
  })

  const isVideo = computed(() => {
    if (!state.value.currentMedia) return false
    return state.value.currentMedia.type === 'video'
  })

  const isAudio = computed(() => {
    if (!state.value.currentMedia) return false
    return state.value.currentMedia.type === 'audio'
  })

  const isDocument = computed(() => {
    if (!state.value.currentMedia) return false
    return state.value.currentMedia.type === 'document'
  })

  function getMediaType(url) {
    const extension = url.split('.').pop()?.toLowerCase() || ''

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    const videoExtensions = ['mp4', 'webm', 'ogg']
    const audioExtensions = ['mp3', 'wav', 'ogg']
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']

    if (imageExtensions.includes(extension)) return 'image'
    if (videoExtensions.includes(extension)) return 'video'
    if (audioExtensions.includes(extension)) return 'audio'
    if (documentExtensions.includes(extension)) return 'document'

    return 'unknown'
  }

  function getFileName(url) {
    return url.split('/').pop() || 'arquivo'
  }

  function openMedia(message) {
    if (!message.mediaUrl) return

    const mediaType = getMediaType(message.mediaUrl)
    const fileName = getFileName(message.mediaUrl)

    state.value = {
      isOpen: true,
      currentMedia: {
        url: message.mediaUrl,
        type: mediaType,
        title: fileName
      }
    }

    if (mediaType === 'document') {
      // Abre documentos em uma nova aba
      window.open(message.mediaUrl, '_blank')
      state.value.isOpen = false
      return
    }

    if (mediaType === 'unknown') {
      $q.notify({
        type: 'negative',
        message: 'Tipo de arquivo não suportado'
      })
      state.value.isOpen = false
      return
    }
  }

  function closeMedia() {
    state.value = {
      isOpen: false,
      currentMedia: null
    }
  }

  function downloadMedia() {
    if (!state.value.currentMedia?.url) return

    const link = document.createElement('a')
    link.href = state.value.currentMedia.url
    link.download = state.value.currentMedia.title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    state,
    isImage,
    isVideo,
    isAudio,
    isDocument,
    openMedia,
    closeMedia,
    downloadMedia
  }
}
