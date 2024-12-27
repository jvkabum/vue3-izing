import { ref } from 'vue'

export const useScroll = () => {
  const scrollContainer = ref(null)
  const showScrollIcon = ref(false)
  const inputHeight = ref(0)

  function handleScroll(e) {
    if (!e) return
    
    setTimeout(() => {
      showScrollIcon.value = (
        e.verticalSize - (e.verticalPosition + e.verticalContainerSize)
      ) > 2000
    }, 200)
  }

  function scrollToBottom() {
    document.getElementById('messageListStart').scrollIntoView()
  }

  function handleInputResize(size) {
    inputHeight.value = size.height
  }

  return {
    scrollContainer,
    showScrollIcon,
    inputHeight,
    handleScroll,
    scrollToBottom,
    handleInputResize
  }
}
