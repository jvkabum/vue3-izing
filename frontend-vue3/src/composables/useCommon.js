import { formatDistance, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useCommon() {
  const dataInWords = (timestamp, updated) => {
    try {
      let data = parseISO(updated)
      if (timestamp) {
        data = new Date(Number(timestamp))
      }
      return formatDistance(data, new Date(), { 
        locale: ptBR,
        addSuffix: true 
      })
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return ''
    }
  }

  const formatarData = (data, formatStr = 'dd/MM/yyyy HH:mm') => {
    try {
      if (!data) return ''
      const date = typeof data === 'string' ? parseISO(data) : new Date(data)
      return format(date, formatStr, { locale: ptBR })
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return ''
    }
  }

  const farmatarMensagemWhatsapp = (mensagem) => {
    if (!mensagem) return ''
    
    // Remove caracteres especiais
    let texto = mensagem.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    
    // Remove emojis
    texto = texto.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
    
    // Remove múltiplos espaços em branco
    texto = texto.replace(/\s+/g, ' ')
    
    // Remove espaços no início e fim
    texto = texto.trim()
    
    return texto
  }

  const getValue = (obj, prop) => {
    try {
      return obj[prop]
    } catch (error) {
      return ''
    }
  }

  const isValidUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch (error) {
      return false
    }
  }

  const truncateText = (text, length = 50) => {
    if (!text) return ''
    return text.length > length ? text.substring(0, length) + '...' : text
  }

  const generateRandomId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const debounce = (fn, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn.apply(this, args), delay)
    }
  }

  const throttle = (fn, limit) => {
    let inThrottle
    return (...args) => {
      if (!inThrottle) {
        fn.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  return {
    dataInWords,
    formatarData,
    farmatarMensagemWhatsapp,
    getValue,
    isValidUrl,
    truncateText,
    generateRandomId,
    formatFileSize,
    debounce,
    throttle
  }
}
