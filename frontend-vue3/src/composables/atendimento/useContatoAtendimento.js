import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Composable para gerenciar lógica do item de contato no atendimento
 * @param {Object} props - Props do componente
 * @param {Function} emit - Função para emitir eventos
 * @returns {Object} Objeto contendo estados e métodos do contato
 */
export function useContatoAtendimento(props, emit) {
  const route = useRoute()

  /**
   * Verifica se o item está ativo baseado na rota atual
   */
  const isActive = computed(() => {
    if (!props.routeName) return false
    return route.name === props.routeName
  })

  /**
   * Define a cor do status baseado no estado
   */
  const statusColor = computed(() => {
    const colors = {
      online: 'positive',
      offline: 'grey',
      away: 'warning',
      busy: 'negative'
    }
    return colors[props.status] || 'grey'
  })

  /**
   * Formata o tempo da última atividade
   */
  const lastActivityTime = computed(() => {
    if (!props.lastActivity) return ''

    try {
      const date = parseISO(props.lastActivity)
      const now = new Date()
      const diffInHours = Math.abs(now - date) / 36e5

      // Se for menos de 24 horas, mostra apenas a hora
      if (diffInHours < 24) {
        return format(date, 'HH:mm')
      }
      
      // Se for menos de 7 dias, mostra o dia da semana
      if (diffInHours < 168) {
        return format(date, 'EEEE', { locale: ptBR })
      }
      
      // Caso contrário, mostra a data completa
      return format(date, 'dd/MM/yyyy')
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return props.lastActivity
    }
  })

  /**
   * Retorna a URL do avatar ou undefined
   */
  const getAvatarUrl = computed(() => {
    if (!props.avatarUrl) return undefined
    
    // Verifica se a URL é válida
    try {
      new URL(props.avatarUrl)
      return props.avatarUrl
    } catch {
      return undefined
    }
  })

  /**
   * Manipula o clique no item
   * @param {Event} event - Evento de clique
   */
  const handleClick = (event) => {
    if (props.disabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    
    emit('click', event)
  }

  return {
    isActive,
    statusColor,
    lastActivityTime,
    getAvatarUrl,
    handleClick
  }
}
