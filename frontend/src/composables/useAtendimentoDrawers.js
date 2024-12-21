import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export function useAtendimentoDrawers() {
  const $q = useQuasar()
  const store = useStore()
  const router = useRouter()
  const route = useRoute()

  // Estado
  const drawerTickets = ref(true)
  const drawerContact = ref(true)
  const toolbarSearch = ref(true)

  // Computed
  const ticketFocado = computed(() => store.getters.ticketFocado)
  const isContactDrawerEnabled = computed(() => 
    !isContactsRoute.value && ticketFocado.value?.id
  )

  const isContactsRoute = computed(() => 
    route.name === 'chat-contatos'
  )

  const drawerWidth = computed(() => 
    $q.screen.lt.md ? $q.screen.width : 380
  )

  const style = computed(() => ({
    height: `${$q.screen.height}px`
  }))

  // Métodos
  const toggleTicketsDrawer = () => {
    drawerTickets.value = !drawerTickets.value
  }

  const toggleContactDrawer = () => {
    drawerContact.value = !drawerContact.value
  }

  const toggleToolbarSearch = () => {
    toolbarSearch.value = !toolbarSearch.value
  }

  const handleScreenSize = () => {
    // Em telas pequenas, fechar drawer de tickets ao abrir chat
    if ($q.screen.lt.md && ticketFocado.value?.status !== 'pending') {
      drawerTickets.value = false
    }
  }

  const openChat = (ticket) => {
    // Fechar drawer em mobile ao abrir chat
    if ($q.screen.lt.md && ticket.status !== 'pending') {
      drawerTickets.value = false
    }

    if (!(ticket.status !== 'pending' && 
      (ticket.id !== store.getters.ticketFocado.id || route.name !== 'chat'))) {
      return
    }

    store.commit('SET_HAS_MORE', true)
    store.dispatch('AbrirChatMensagens', ticket)
  }

  const setupEventListeners = () => {
    // Eventos globais
    const root = router.app.config.globalProperties.$root
    root.$on('infor-cabecalo-chat:acao-menu', toggleTicketsDrawer)
    root.$on('update-ticket:info-contato', toggleContactDrawer)

    // Cleanup
    onUnmounted(() => {
      root.$off('infor-cabecalo-chat:acao-menu', toggleTicketsDrawer)
      root.$off('update-ticket:info-contato', toggleContactDrawer)
    })
  }

  // Watch para mudanças de rota
  watch(() => route.name, (newRoute) => {
    if (newRoute === 'chat-empty') {
      drawerContact.value = false
    }
  })

  // Watch para ticket focado
  watch(ticketFocado, () => {
    handleScreenSize()
  })

  return {
    // Estado
    drawerTickets,
    drawerContact,
    toolbarSearch,

    // Computed
    isContactDrawerEnabled,
    isContactsRoute,
    drawerWidth,
    style,

    // Métodos
    toggleTicketsDrawer,
    toggleContactDrawer,
    toggleToolbarSearch,
    handleScreenSize,
    openChat,
    setupEventListeners
  }
}
