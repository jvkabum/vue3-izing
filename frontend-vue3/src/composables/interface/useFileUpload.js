import { ref, computed } from 'vue'
import { uid } from 'quasar'

export function useFileUpload() {
  // Constantes
  const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
  const MAX_TOTAL_SIZE = 15 * 1024 * 1024 // 15MB
  const MAX_FILES = 5

  const ACCEPTED_FORMATS = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', 'image/*'],
    video: ['.mp4', '.webm', '.ogg'],
    audio: ['.mp3', '.wav', '.ogg'],
    document: [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx',
      '.ppt', '.pptx', '.txt', '.xml'
    ],
    archive: ['.zip', '.rar']
  }

  // Estado
  const files = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const totalSize = computed(() => 
    files.value.reduce((total, file) => total + file.size, 0)
  )

  const hasFiles = computed(() => files.value.length > 0)

  const isValidTotal = computed(() => 
    totalSize.value <= MAX_TOTAL_SIZE
  )

  // Métodos
  const validateFile = (file) => {
    const errors = []

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`Arquivo muito grande (máx. ${formatFileSize(MAX_FILE_SIZE)})`)
    }

    // Validar formato
    const extension = `.${file.name.split('.').pop().toLowerCase()}`
    const isValidFormat = Object.values(ACCEPTED_FORMATS)
      .flat()
      .some(format => 
        format.toLowerCase() === extension ||
        format.includes('/*') && file.type.startsWith(format.replace('/*', '/'))
      )

    if (!isValidFormat) {
      errors.push('Formato não suportado')
    }

    return errors
  }

  const addFiles = (newFiles) => {
    error.value = null

    // Validar número máximo
    if (files.value.length + newFiles.length > MAX_FILES) {
      error.value = `Máximo de ${MAX_FILES} arquivos permitido`
      return false
    }

    // Validar cada arquivo
    const validFiles = []
    const errors = []

    for (const file of newFiles) {
      const fileErrors = validateFile(file)
      if (fileErrors.length) {
        errors.push(`${file.name}: ${fileErrors.join(', ')}`)
      } else {
        validFiles.push(file)
      }
    }

    // Validar tamanho total
    const newTotalSize = totalSize.value + validFiles.reduce((sum, file) => sum + file.size, 0)
    if (newTotalSize > MAX_TOTAL_SIZE) {
      error.value = `Tamanho total excede ${formatFileSize(MAX_TOTAL_SIZE)}`
      return false
    }

    // Atualizar lista se houver arquivos válidos
    if (validFiles.length) {
      files.value = [...files.value, ...validFiles]
    }

    // Retornar erro se houver
    if (errors.length) {
      error.value = errors.join('\n')
      return false
    }

    return true
  }

  const removeFile = (index) => {
    files.value.splice(index, 1)
    error.value = null
  }

  const clearFiles = () => {
    files.value = []
    error.value = null
  }

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    
    const extension = `.${file.name.split('.').pop().toLowerCase()}`
    
    if (ACCEPTED_FORMATS.document.includes(extension)) return 'document'
    if (ACCEPTED_FORMATS.archive.includes(extension)) return 'archive'
    
    return 'file'
  }

  const getFileIcon = (file) => {
    const type = getFileType(file)
    
    const icons = {
      image: 'mdi-file-image',
      video: 'mdi-file-video',
      audio: 'mdi-file-music',
      document: 'mdi-file-document',
      archive: 'mdi-zip-box',
      file: 'mdi-file'
    }

    return icons[type]
  }

  const getFileColor = (file) => {
    const type = getFileType(file)
    
    const colors = {
      image: 'green',
      video: 'red',
      audio: 'purple',
      document: 'blue',
      archive: 'brown',
      file: 'grey'
    }

    return colors[type]
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const createFormData = (extraData = {}) => {
    if (!files.value.length) return null

    const formData = new FormData()
    
    files.value.forEach(file => {
      formData.append('medias', file)
      formData.append('body', file.name)
    })

    formData.append('fromMe', true)
    formData.append('id', uid())

    Object.entries(extraData).forEach(([key, value]) => {
      formData.append(key, value)
    })

    return formData
  }

  return {
    // Estado
    files,
    loading,
    error,

    // Computed
    totalSize,
    hasFiles,
    isValidTotal,

    // Constantes
    MAX_FILE_SIZE,
    MAX_TOTAL_SIZE,
    MAX_FILES,
    ACCEPTED_FORMATS,

    // Métodos
    addFiles,
    removeFile,
    clearFiles,
    getFileType,
    getFileIcon,
    getFileColor,
    formatFileSize,
    createFormData
  }
}
