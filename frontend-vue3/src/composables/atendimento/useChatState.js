import { ref, computed } from 'vue'
import { useAtendimentoStore } from 'src/stores/atendimento'
import { useAtendimentoNotification } from './useAtendimentoNotification'
import { useMessageFormat } from './useMessageFormat'

export function useChatState() {
  const store = useAtendimentoStore()
  const notification = useAtendimentoNotification()
  const { formatRelativeDate } = useMessageFormat()

  // Estado
  const loading = ref(false)
  const hasMore = ref(true)
  const pageNumber = ref(1)
  const showScrollIcon = ref(false)
  const inputHeight = ref(0)

  // Computed
  const messages = computed(() => store.messages)
  const ticketFocado = computed(() => store.ticketFocado)
  const isTicketOpen = computed(() => ticketFocado.value?.status === 'open')

  const formattedMessages = computed(() => 
    messages.value.map(message => ({
      ...message,
      formattedDate: formatRelativeDate(message.createdAt)
    }))
  )

  const groupedMessages = computed(() => {
    const groups = {}
    formattedMessages.value.forEach(message => {
      const date = message.formattedDate
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    return groups
  })

  // Métodos
  const loadMoreMessages = async () => {
    if (!hasMore.value || loading.value || !ticketFocado.value?.id) return

    loading.value = true
    try {
      const result = await store.loadMoreMessages({
        ticketId: ticketFocado.value.id,
        pageNumber: pageNumber.value
      })

      hasMore.value = result.hasMore
      if (hasMore.value) {
        pageNumber.value++
      }
    } catch {
      notification.notifyError('Erro ao carregar mensagens')
    } finally {
      loading.value = false
    }
  }

  const handleScroll = e => {
    if (!e) return
    
    setTimeout(() => {
      showScrollIcon.value = (
        e.verticalSize - (e.verticalPosition + e.verticalContainerSize)
      ) > 2000
    }, 200)
  }

  const scrollToBottom = () => {
    document.getElementById('messageListStart')?.scrollIntoView({
      behavior: 'smooth'
    })
  }

  const handleInputResize = size => {
    inputHeight.value = size.height
  }

  const resetState = () => {
    loading.value = false
    hasMore.value = true
    pageNumber.value = 1
    showScrollIcon.value = false
    inputHeight.value = 0
  }

  const focusTicket = async ticket => {
    try {
      loading.value = true
      resetState()
      await store.setTicketFocado(ticket)
      await loadMoreMessages()
      scrollToBottom()
    } catch {
      notification.notifyError('Erro ao focar ticket')
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    loading,
    hasMore,
    pageNumber,
    showScrollIcon,
    inputHeight,

    // Computed
    messages,
    ticketFocado,
    isTicketOpen,
    formattedMessages,
    groupedMessages,

    // Métodos
    loadMoreMessages,
    handleScroll,
    scrollToBottom,
    handleInputResize,
    resetState,
    focusTicket
  }
}
