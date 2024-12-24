import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuth } from './useAuth'

export function useTheme() {
  // Composables
  const $q = useQuasar()
  const { updatePreferences } = useAuth()

  // Estado
  const loading = ref(false)
  const error = ref(null)

  // Configurações padrão
  const defaultColors = {
    primary: '#1976D2',
    secondary: '#26A69A',
    accent: '#9C27B0',
    positive: '#21BA45',
    negative: '#C10015',
    info: '#31CCEC',
    warning: '#F2C037'
  }

  const defaultConfig = {
    dense: false,
    flat: false,
    outlined: true,
    borderRadius: 8,
    fontSize: 14
  }

  // Computed
  const isDark = computed({
    get: () => $q.dark.isActive,
    set: (value) => {
      $q.dark.set(value)
      saveThemePreference({ isDark: value })
    }
  })

  const currentColors = computed(() => ({
    primary: $q.config.brand.primary,
    secondary: $q.config.brand.secondary,
    accent: $q.config.brand.accent,
    positive: $q.config.brand.positive,
    negative: $q.config.brand.negative,
    info: $q.config.brand.info,
    warning: $q.config.brand.warning
  }))

  // CSS Variables
  const cssVars = computed(() => {
    const colors = currentColors.value
    const vars = {}

    // Cores principais
    Object.entries(colors).forEach(([name, color]) => {
      vars[`--q-${name}`] = color
      vars[`--q-${name}-rgb`] = hexToRgb(color)
    })

    // Configurações
    vars['--q-border-radius'] = `${defaultConfig.borderRadius}px`
    vars['--q-font-size'] = `${defaultConfig.fontSize}px`

    return vars
  })

  // Métodos
  const initTheme = () => {
    // Carregar tema do localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme)
        applyTheme(theme)
      } catch (err) {
        console.error('Erro ao carregar tema:', err)
      }
    }

    // Aplicar modo escuro baseado nas preferências do sistema
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
    }
  }

  const applyTheme = (theme) => {
    // Modo escuro
    if (theme.isDark !== undefined) {
      isDark.value = theme.isDark
    }

    // Cores
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (defaultColors[key]) {
          $q.config.brand[key] = value
        }
      })
    }

    // Configurações
    if (theme.config) {
      Object.assign(defaultConfig, theme.config)
    }

    // Aplicar variáveis CSS
    updateCssVars()
  }

  const saveThemePreference = async (preferences) => {
    try {
      loading.value = true
      error.value = null

      // Salvar no localStorage
      const currentTheme = JSON.parse(localStorage.getItem('theme') || '{}')
      const newTheme = {
        ...currentTheme,
        ...preferences
      }
      localStorage.setItem('theme', JSON.stringify(newTheme))

      // Salvar no servidor
      await updatePreferences(preferences)

      return true
    } catch (err) {
      error.value = 'Erro ao salvar preferências de tema'
      console.error('Erro ao salvar tema:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateCssVars = () => {
    const vars = cssVars.value
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
  }

  const resetTheme = async () => {
    try {
      loading.value = true
      
      // Resetar para valores padrão
      Object.assign($q.config.brand, defaultColors)
      Object.assign(defaultConfig, {
        dense: false,
        flat: false,
        outlined: true,
        borderRadius: 8,
        fontSize: 14
      })

      // Limpar localStorage
      localStorage.removeItem('theme')

      // Atualizar servidor
      await updatePreferences({
        isDark: false,
        colors: defaultColors,
        config: defaultConfig
      })

      // Aplicar mudanças
      updateCssVars()
      isDark.value = false

      return true
    } catch (err) {
      error.value = 'Erro ao resetar tema'
      console.error('Erro ao resetar tema:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Utilitários
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : null
  }

  // Observadores
  watch(currentColors, () => {
    updateCssVars()
  }, { deep: true })

  // Inicialização
  initTheme()

  // Listener para mudanças no sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches
    }
  })

  return {
    // Estado
    loading,
    error,
    isDark,
    currentColors,
    defaultConfig,

    // Métodos
    applyTheme,
    saveThemePreference,
    resetTheme,
    updateCssVars
  }
}
