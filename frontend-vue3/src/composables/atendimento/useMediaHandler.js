import { ref } from 'vue'
import { useAtendimentoNotification } from './useAtendimentoNotification'

export function useMediaHandler() {
  const notification = useAtendimentoNotification()

  // Estado
  const loading = ref(false)
  const showMediaPreview = ref(false)
  const mediaUrl = ref('')
  const mediaType = ref('')

  // Constantes
  const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/wav', 'audio/ogg']
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']

  // Métodos
  const validateFile = file => {
    if (file.size > MAX_FILE_SIZE) {
      notification.notifyError('Arquivo muito grande. Máximo 15MB.')
      return false
    }

    const allowedTypes = [
      ...ALLOWED_IMAGE_TYPES,
      ...ALLOWED_DOCUMENT_TYPES,
      ...ALLOWED_AUDIO_TYPES,
      ...ALLOWED_VIDEO_TYPES
    ]

    if (!allowedTypes.includes(file.type)) {
      notification.notifyError('Tipo de arquivo não suportado')
      return false
    }

    return true
  }

  const getMediaType = file => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) return 'image'
    if (ALLOWED_DOCUMENT_TYPES.includes(file.type)) return 'document'
    if (ALLOWED_AUDIO_TYPES.includes(file.type)) return 'audio'
    if (ALLOWED_VIDEO_TYPES.includes(file.type)) return 'video'
    return 'unknown'
  }

  const previewMedia = file => {
    if (!validateFile(file)) return

    loading.value = true
    try {
      const reader = new FileReader()
      reader.onload = e => {
        mediaUrl.value = e.target.result
        mediaType.value = getMediaType(file)
        showMediaPreview.value = true
      }
      reader.readAsDataURL(file)
    } catch {
      notification.notifyError('Erro ao carregar preview')
    } finally {
      loading.value = false
    }
  }

  const closePreview = () => {
    showMediaPreview.value = false
    mediaUrl.value = ''
    mediaType.value = ''
  }

  const handlePastedMedia = e => {
    const file = e.clipboardData.files[0]
    if (file && validateFile(file)) {
      previewMedia(file)
      return file
    }
    return null
  }

  const formatFileSize = size => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return {
    loading,
    showMediaPreview,
    mediaUrl,
    mediaType,
    validateFile,
    getMediaType,
    previewMedia,
    closePreview,
    handlePastedMedia,
    formatFileSize
  }
}
