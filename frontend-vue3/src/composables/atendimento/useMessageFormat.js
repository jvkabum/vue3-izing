import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useMessageFormat() {
  const formatDate = (date, pattern = 'dd/MM/yyyy HH:mm') => {
    if (!date) return ''
    return format(new Date(date), pattern, { locale: ptBR })
  }

  const formatRelativeDate = date => {
    if (!date) return ''

    const messageDate = new Date(date)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffTime = today.getTime() - messageDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return format(messageDate, "'Hoje às' HH:mm", { locale: ptBR })
    }

    if (diffDays === 1) {
      return format(messageDate, "'Ontem às' HH:mm", { locale: ptBR })
    }

    if (diffDays <= 7) {
      return format(messageDate, "EEEE 'às' HH:mm", { locale: ptBR })
    }

    if (messageDate.getFullYear() === now.getFullYear()) {
      return format(messageDate, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })
    }

    return format(messageDate, "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  }

  const formatMessageBody = body => {
    if (!body) return ''

    // Remove múltiplas quebras de linha
    let formatted = body.replace(/\n{3,}/g, '\n\n')

    // Converte URLs em links clicáveis
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    )

    // Converte emoticons em emojis
    formatted = formatted
      .replace(/:\)/g, '😊')
      .replace(/:\(/g, '😢')
      .replace(/:D/g, '😃')
      .replace(/;\)/g, '😉')
      .replace(/:P/g, '😛')
      .replace(/<3/g, '❤️')

    // Formata menções (@username)
    formatted = formatted.replace(
      /@(\w+)/g,
      '<span class="mention">@$1</span>'
    )

    // Formata hashtags (#tag)
    formatted = formatted.replace(
      /#(\w+)/g,
      '<span class="hashtag">#$1</span>'
    )

    return formatted
  }

  const formatPhoneNumber = phone => {
    if (!phone) return ''

    // Remove todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, '')

    // Formato: (XX) XXXXX-XXXX
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }

    // Formato: (XX) XXXX-XXXX
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }

    return phone
  }

  return {
    formatDate,
    formatRelativeDate,
    formatMessageBody,
    formatPhoneNumber
  }
}
