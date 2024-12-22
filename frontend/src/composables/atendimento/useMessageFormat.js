import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useMessageFormat() {
  /**
   * Formata a data da mensagem para o formato brasileiro
   * @param {string | Date} date - Data a ser formatada
   * @returns {string} Data formatada (dd/MM/yyyy HH:mm)
   */
  const formatMessageDate = (date) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR })
  }

  /**
   * Retorna o ícone apropriado baseado no tipo de mídia
   * @param {string} mediaType - Tipo de mídia (image, video, audio, document)
   * @returns {string} Nome do ícone do Material Design Icons
   */
  const getMediaIcon = (mediaType) => {
    const mediaIcons = {
      image: 'mdi-image',
      video: 'mdi-video',
      audio: 'mdi-volume-high',
      document: 'mdi-file-document-outline'
    }
    return mediaIcons[mediaType] || 'mdi-attachment'
  }

  return {
    formatMessageDate,
    getMediaIcon
  }
}
