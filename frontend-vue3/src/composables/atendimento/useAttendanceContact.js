import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useContatoAtendimento(props, emit) {
  const router = useRouter()
  const route = useRoute()

  const isActive = computed(() => route.name === props.routeName)

  const statusColor = computed(() => {
    if (props.status === 'online') return 'positive'
    if (props.status === 'busy') return 'negative'
    if (props.status === 'away') return 'warning'
    return 'grey'
  })

  const lastActivityTime = computed(() => {
    if (!props.lastActivity) return ''
    // Lógica para formatar o tempo de última atividade
    const now = new Date()
    const activity = new Date(props.lastActivity)
    const diff = now - activity
    
    if (diff < 60000) return 'Agora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
    return activity.toLocaleDateString()
  })

  const handleClick = (event) => {
    if (props.disabled) {
      event.preventDefault()
      return
    }

    emit('click', event)
    
    if (!isActive.value && props.routeName) {
      router.push({ name: props.routeName })
    }
  }

  const getAvatarUrl = computed(() => {
    if (props.avatarUrl) return props.avatarUrl
    return props.icon ? null : '/default-avatar.png'
  })

  return {
    isActive,
    statusColor,
    lastActivityTime,
    handleClick,
    getAvatarUrl
  }
}
