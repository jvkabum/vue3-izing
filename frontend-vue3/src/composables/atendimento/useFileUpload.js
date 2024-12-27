import { ref } from 'vue'
import { useQuasar } from 'quasar'

const defaultOptions = {
  maxFileSize: 15 * 1024 * 1024, // 15MB
  maxTotalSize: 15 * 1024 * 1024, // 15MB
  allowedTypes: [
    '.txt', '.xml', '.jpg', '.png', 'image/jpeg', '.pdf',
    '.doc', '.docx', '.mp4', '.ogg', '.mp3', '.xls',
    '.xlsx', '.jpeg', '.rar', '.zip', '.ppt', '.pptx',
    'image/*'
  ]
}

export function useFileUpload(options = {}) {
  const $q = useQuasar()
  const files = ref([])
  const loading = ref(false)

  const mergedOptions = {
    ...defaultOptions,
    ...options
  }

  function validateFile(file) {
    // Validar tamanho do arquivo
    if (file.size > mergedOptions.maxFileSize) {
      $q.notify({
        type: 'negative',
        message: 'Arquivo muito grande',
        caption: `Tamanho máximo permitido: ${mergedOptions.maxFileSize / (1024 * 1024)}MB`
      })
      return false
    }

    // Validar tipo do arquivo
    const fileType = file.type || file.name.split('.').pop() || ''
    const isValidType = mergedOptions.allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', ''))
      }
      return fileType === type
    })

    if (!isValidType) {
      $q.notify({
        type: 'negative',
        message: 'Tipo de arquivo não permitido',
        caption: 'Verifique os formatos aceitos'
      })
      return false
    }

    return true
  }

  function validateTotalSize(newFiles) {
    const totalSize = [...files.value, ...newFiles].reduce((sum, file) => sum + file.size, 0)
    if (totalSize > mergedOptions.maxTotalSize) {
      $q.notify({
        type: 'negative',
        message: 'Tamanho total dos arquivos excedido',
        caption: `Tamanho máximo total permitido: ${mergedOptions.maxTotalSize / (1024 * 1024)}MB`
      })
      return false
    }
    return true
  }

  function addFiles(newFiles) {
    const fileArray = Array.isArray(newFiles) ? newFiles : [newFiles]
    const validFiles = fileArray.filter(validateFile)

    if (validFiles.length && validateTotalSize(validFiles)) {
      files.value.push(...validFiles)
    }
  }

  function removeFile(index) {
    files.value.splice(index, 1)
  }

  function clearFiles() {
    files.value = []
  }

  function createFormData() {
    const formData = new FormData()
    files.value.forEach(file => {
      formData.append('medias', file, file.name)
    })
    return formData
  }

  return {
    files,
    loading,
    addFiles,
    removeFile,
    clearFiles,
    createFormData
  }
}
