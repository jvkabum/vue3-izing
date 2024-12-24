import { ref, onMounted } from 'vue'

export function useScroll(options = {}) {
  const scrollContainer = ref(null)
  const showScrollIcon = ref(false)
  const isScrolling = ref(false)
  const scrollPosition = ref(0)

  const scrollToBottom = (smooth = true) => {
    if (!scrollContainer.value) return

    const container = scrollContainer.value
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  const handleScroll = (event) => {
    const container = event.target
    scrollPosition.value = container.scrollTop
    
    // Mostrar ícone quando não estiver no final
    const atBottom = container.scrollHeight - container.scrollTop === container.clientHeight
    showScrollIcon.value = !atBottom

    // Detectar scroll
    if (isScrolling.value) return
    isScrolling.value = true
    setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }

  onMounted(() => {
    if (options.scrollToBottomOnMount) {
      scrollToBottom(false)
    }
  })

  return {
    scrollContainer,
    showScrollIcon,
    isScrolling,
    scrollPosition,
    scrollToBottom,
    handleScroll
  }
} 