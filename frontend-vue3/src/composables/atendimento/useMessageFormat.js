import { computed } from 'vue'
import { format } from 'date-fns'

export function useMessageFormat(props) {
  const formattedDate = computed(() => {
    if (!props.message.createdAt) return ''

    const date = new Date(props.message.createdAt)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    const diffTime = today.getTime() - messageDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return format(date, "'Hoje às' HH:mm")
    }

    if (diffDays === 1) {
      return format(date, "'Ontem às' HH:mm")
    }

    if (diffDays <= 7) {
      return format(date, "EEEE 'às' HH:mm")
    }

    if (date.getFullYear() === now.getFullYear()) {
      return format(date, "d 'de' MMMM 'às' HH:mm")
    }

    return format(date, "d 'de' MMMM 'de' yyyy 'às' HH:mm")
  })

  const messageClasses = computed(() => {
    const classes = ['message-bubble']

    if (props.message.fromMe) {
      classes.push('from-me')
    } else {
      classes.push('from-contact')
    }

    if (props.isConsecutive) {
      classes.push('consecutive')
    }

    if (props.message.isDeleted) {
      classes.push('deleted')
    }

    if (props.message.mediaUrl) {
      classes.push('has-media')
    }

    if (props.message.quotedMsg) {
      classes.push('has-quote')
    }

    return classes.join(' ')
  })

  const messageStyle = computed(() => {
    const style = {}

    if (props.message.backgroundColor) {
      style.backgroundColor = props.message.backgroundColor
    }

    if (props.message.textColor) {
      style.color = props.message.textColor
    }

    return style
  })

  function formatBody(body) {
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

    return formatted
  }

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

  return {
    formattedDate,
    messageClasses,
    messageStyle,
    formatBody,
    getMediaType
  }
}
