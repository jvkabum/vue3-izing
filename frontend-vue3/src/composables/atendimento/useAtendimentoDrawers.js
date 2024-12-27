import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

export function useAtendimentoDrawers() {
  const $q = useQuasar()
  const selectedTicket = ref(null)

  const drawers = ref({
    left: true,
    right: false,
    contactInfo: false,
    quickReplies: false,
    settings: false
  })

  const isMobile = computed(() => {
    return $q.screen.lt.md
  })

  // Left Drawer (Lista de Tickets)
  function toggleLeftDrawer() {
    if (isMobile.value && drawers.value.right) {
      drawers.value.right = false
    }
    drawers.value.left = !drawers.value.left
  }

  function openLeftDrawer() {
    if (isMobile.value && drawers.value.right) {
      drawers.value.right = false
    }
    drawers.value.left = true
  }

  function closeLeftDrawer() {
    drawers.value.left = false
  }

  // Right Drawer (Informações Extras)
  function toggleRightDrawer() {
    if (isMobile.value && drawers.value.left) {
      drawers.value.left = false
    }
    drawers.value.right = !drawers.value.right
  }

  function openRightDrawer() {
    if (isMobile.value && drawers.value.left) {
      drawers.value.left = false
    }
    drawers.value.right = true
  }

  function closeRightDrawer() {
    drawers.value.right = false
  }

  // Contact Info Drawer
  function toggleContactInfo() {
    drawers.value.contactInfo = !drawers.value.contactInfo
  }

  function openContactInfo(ticket) {
    selectedTicket.value = ticket
    drawers.value.contactInfo = true
  }

  function closeContactInfo() {
    drawers.value.contactInfo = false
    selectedTicket.value = null
  }

  // Quick Replies Drawer
  function toggleQuickReplies() {
    drawers.value.quickReplies = !drawers.value.quickReplies
  }

  function openQuickReplies() {
    drawers.value.quickReplies = true
  }

  function closeQuickReplies() {
    drawers.value.quickReplies = false
  }

  // Settings Drawer
  function toggleSettings() {
    drawers.value.settings = !drawers.value.settings
  }

  function openSettings() {
    drawers.value.settings = true
  }

  function closeSettings() {
    drawers.value.settings = false
  }

  // Responsive Handlers
  function handleResize() {
    if (isMobile.value) {
      // Em telas pequenas, não mostra as duas gavetas ao mesmo tempo
      if (drawers.value.left && drawers.value.right) {
        drawers.value.right = false
      }
    }
  }

  // Close All Drawers
  function closeAllDrawers() {
    drawers.value = {
      left: false,
      right: false,
      contactInfo: false,
      quickReplies: false,
      settings: false
    }
    selectedTicket.value = null
  }

  return {
    // State
    drawers,
    selectedTicket,
    isMobile,

    // Left Drawer
    toggleLeftDrawer,
    openLeftDrawer,
    closeLeftDrawer,

    // Right Drawer
    toggleRightDrawer,
    openRightDrawer,
    closeRightDrawer,

    // Contact Info
    toggleContactInfo,
    openContactInfo,
    closeContactInfo,

    // Quick Replies
    toggleQuickReplies,
    openQuickReplies,
    closeQuickReplies,

    // Settings
    toggleSettings,
    openSettings,
    closeSettings,

    // Utils
    handleResize,
    closeAllDrawers
  }
}
