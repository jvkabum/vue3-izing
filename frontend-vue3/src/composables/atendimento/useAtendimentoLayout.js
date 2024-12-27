import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAtendimentoNotification } from './useAtendimentoNotification'

export function useAtendimentoLayout() {
  const $q = useQuasar()
  const router = useRouter()
  const notification = useAtendimentoNotification()

  // Estado
  const drawerOpen = ref($q.screen.gt.sm)
  const activeTab = ref('open')
  const showSearch = ref(false)
  const searchQuery = ref('')
  const showFilters = ref(false)
  const showSettings = ref(false)

  // Computed
  const isMobile = computed(() => $q.screen.lt.sm)
  const drawerWidth = computed(() => isMobile.value ? '100%' : '350px')
  const contentStyle = computed(() => ({
    width: drawerOpen.value && !isMobile.value ? `calc(100% - ${drawerWidth.value})` : '100%'
  }))

  // Métodos
  const toggleDrawer = () => {
    drawerOpen.value = !drawerOpen.value
  }

  const setActiveTab = tab => {
    activeTab.value = tab
  }

  const toggleSearch = () => {
    showSearch.value = !showSearch.value
    if (!showSearch.value) {
      searchQuery.value = ''
    }
  }

  const setSearchQuery = query => {
    searchQuery.value = query
  }

  const toggleFilters = () => {
    showFilters.value = !showFilters.value
  }

  const toggleSettings = () => {
    showSettings.value = !showSettings.value
  }

  const navigateTo = (route, params = {}) => {
    try {
      router.push({ name: route, params })
    } catch {
      notification.notifyError('Erro ao navegar')
    }
  }

  const handleBackNavigation = () => {
    if (isMobile.value && drawerOpen.value) {
      drawerOpen.value = false
    } else {
      router.back()
    }
  }

  const handleEscapeKey = () => {
    if (showSearch.value) {
      toggleSearch()
    } else if (showFilters.value) {
      toggleFilters()
    } else if (showSettings.value) {
      toggleSettings()
    } else if (isMobile.value && drawerOpen.value) {
      drawerOpen.value = false
    }
  }

  const resetLayout = () => {
    if (isMobile.value) {
      drawerOpen.value = false
    }
    showSearch.value = false
    searchQuery.value = ''
    showFilters.value = false
    showSettings.value = false
  }

  return {
    // Estado
    drawerOpen,
    activeTab,
    showSearch,
    searchQuery,
    showFilters,
    showSettings,

    // Computed
    isMobile,
    drawerWidth,
    contentStyle,

    // Métodos
    toggleDrawer,
    setActiveTab,
    toggleSearch,
    setSearchQuery,
    toggleFilters,
    toggleSettings,
    navigateTo,
    handleBackNavigation,
    handleEscapeKey,
    resetLayout
  }
}
