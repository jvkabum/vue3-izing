import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Composable para gerenciar upload de arquivos
 * @returns {Object} Objeto contendo estados e métodos do upload
 */
export function useFileUpload() {
  const $q = useQuasar()
  const fileInputRef = ref(null)

  // Constantes
  const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
  const MAX_TOTAL_SIZE = 15 * 1024 * 1024 // 15MB
  const ACCEPTED_FORMATS = [
    '.txt', '.xml', '.jpg', '.png', 'image/jpeg', '.pdf',
    '.doc', '.docx', '.mp4', '.ogg', '.mp3', '.xls',
    '.xlsx', '.jpeg', '.rar', '.zip', '.ppt', '.pptx',
    'image/*'
  ].join(',')

  /**
   * Configurações do upload
   */
  const uploadConfig = computed(() => ({
    maxFileSize: MAX_FILE_SIZE,
    maxTotalSize: MAX_TOTAL_SIZE,
    acceptedFormats: ACCEPTED_FORMATS
  }))

  /**
   * Obtém o ícone baseado no tipo do arquivo
   * @param {string} type - Tipo MIME do arquivo
   * @returns {string} Nome do ícone
   */
  const getFileIcon = (type) => {
    const icons = {
      image: 'mdi-image',
      audio: 'mdi-music',
      video: 'mdi-video',
      pdf: 'mdi-file-pdf',
      word: 'mdi-file-word',
      excel: 'mdi-file-excel',
      zip: 'mdi-zip-box',
      rar: 'mdi-zip-box',
      default: 'mdi-file-document'
    }

    const fileType = Object.keys(icons).find(key => type.includes(key))
    return icons[fileType] || icons.default
  }

  /**
   * Obtém a cor baseada no tipo do arquivo
   * @param {string} type - Tipo MIME do arquivo
   * @returns {string} Nome da cor
   */
  const getFileColor = (type) => {
    const colors = {
      image: 'green',
      audio: 'purple',
      video: 'red',
      pdf: 'negative',
      word: 'blue',
      excel: 'positive',
      zip: 'brown',
      rar: 'brown',
      default: 'grey'
    }

    const fileType = Object.keys(colors).find(key => type.includes(key))
    return colors[fileType] || colors.default
  }

  /**
   * Formata o tamanho do arquivo
   * @param {number} bytes - Tamanho em bytes
   * @returns {string} Tamanho formatado
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  /**
   * Remove um arquivo da lista
   * @param {Array} files - Lista atual de arquivos
   * @param {number} index - Índice do arquivo a remover
   * @returns {Array} Nova lista de arquivos
   */
  const removeFile = (files, index) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    return newFiles
  }

  /**
   * Manipula arquivos rejeitados
   * @param {Array} rejectedEntries - Arquivos rejeitados
   */
  const handleRejectedFiles = (rejectedEntries) => {
    const reasons = new Set(rejectedEntries.map(entry => entry.failedPropValidation))
    let message = 'Arquivo(s) rejeitado(s):<br>'
    
    const messages = {
      'max-file-size': '• Arquivo muito grande (máx. 15MB)',
      'max-total-size': '• Tamanho total excede 15MB',
      'max-files': '• Máximo de 5 arquivos permitido',
      'accept': '• Formato não suportado'
    }

    reasons.forEach(reason => {
      if (messages[reason]) {
        message += messages[reason] + '<br>'
      }
    })

    $q.notify({
      type: 'negative',
      message,
      html: true,
      position: 'top',
      timeout: 3000
    })
  }

  /**
   * Abre o seletor de arquivos
   */
  const pickFiles = () => {
    fileInputRef.value?.pickFiles()
  }

  return {
    fileInputRef,
    uploadConfig,
    getFileIcon,
    getFileColor,
    formatFileSize,
    removeFile,
    handleRejectedFiles,
    pickFiles
  }
}
