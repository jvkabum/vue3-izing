import { computed } from 'vue'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useMessageFormatter() {
  // Formatar data da mensagem
  const formatMessageDate = (date) => {
    try {
      const messageDate = typeof date === 'string' ? parseISO(date) : date
      
      if (isToday(messageDate)) {
        return format(messageDate, "'Hoje às' HH:mm", { locale: ptBR })
      }
      
      if (isYesterday(messageDate)) {
        return format(messageDate, "'Ontem às' HH:mm", { locale: ptBR })
      }
      
      return format(messageDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
    } catch (err) {
      console.error('Erro ao formatar data:', err)
      return date
    }
  }

  // Formatar mensagem do WhatsApp (markdown)
  const formatWhatsAppMessage = (message) => {
    if (!message) return ''

    let formattedMessage = message

    // Links
    const urlRegex = /(https?:\/\/[^\s]+)/g
    formattedMessage = formattedMessage.replace(
      urlRegex,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary">$1</a>'
    )

    // Negrito
    formattedMessage = formattedMessage.replace(
      /\*(.*?)\*/g,
      '<strong>$1</strong>'
    )

    // Itálico
    formattedMessage = formattedMessage.replace(
      /_(.*?)_/g,
      '<em>$1</em>'
    )

    // Riscado
    formattedMessage = formattedMessage.replace(
      /~(.*?)~/g,
      '<del>$1</del>'
    )

    // Monospace
    formattedMessage = formattedMessage.replace(
      /```(.*?)```/g,
      '<code>$1</code>'
    )

    // Quebras de linha
    formattedMessage = formattedMessage.replace(/\n/g, '<br>')

    return formattedMessage
  }

  // Formatar status da mensagem
  const formatMessageStatus = (message) => {
    if (!message) return ''

    const statusMap = {
      pending: {
        icon: 'mdi-clock-outline',
        color: 'grey',
        tooltip: 'Aguardando envio'
      },
      sent: {
        icon: 'mdi-check',
        color: 'grey',
        tooltip: 'Enviada'
      },
      received: {
        icon: 'mdi-check-all',
        color: 'grey',
        tooltip: 'Entregue'
      },
      read: {
        icon: 'mdi-check-all',
        color: 'light-blue',
        tooltip: 'Lida'
      },
      error: {
        icon: 'mdi-alert-circle',
        color: 'negative',
        tooltip: 'Erro no envio'
      }
    }

    return statusMap[message.status] || statusMap.sent
  }

  // Formatar nome do contato
  const formatContactName = (contact) => {
    if (!contact) return ''

    const name = contact.name || contact.number
    const number = contact.number && contact.name ? ` (${contact.number})` : ''
    
    return `${name}${number}`
  }

  // Formatar preview de mensagem
  const formatMessagePreview = (message, maxLength = 50) => {
    if (!message) return ''

    let preview = ''

    // Mensagem de mídia
    if (message.mediaUrl) {
      const mediaTypes = {
        image: '📷 Imagem',
        video: '🎥 Vídeo',
        audio: '🎵 Áudio',
        document: '📎 Documento'
      }
      preview = mediaTypes[message.mediaType] || '📎 Arquivo'
    } 
    // Mensagem de texto
    else {
      preview = message.body || ''
    }

    // Remover markdown
    preview = preview.replace(/[\*_~`]/g, '')

    // Limitar tamanho
    if (preview.length > maxLength) {
      preview = preview.substring(0, maxLength) + '...'
    }

    return preview
  }

  // Formatar tamanho de arquivo
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'

    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  return {
    formatMessageDate,
    formatWhatsAppMessage,
    formatMessageStatus,
    formatContactName,
    formatMessagePreview,
    formatFileSize
  }
}
