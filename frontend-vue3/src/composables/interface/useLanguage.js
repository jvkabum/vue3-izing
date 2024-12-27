import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export function useLanguage() {
  const { locale, t } = useI18n()
  const currentLanguage = ref(localStorage.getItem('language') || 'pt-BR')
  const loading = ref(false)
  const error = ref(null)

  const availableLanguages = [
    { code: 'pt-BR', name: 'Português' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ]

  // Observa mudanças no idioma e salva no localStorage
  watch(currentLanguage, (newLang) => {
    localStorage.setItem('language', newLang)
    locale.value = newLang
  })

  const setLanguage = async (lang) => {
    loading.value = true
    try {
      if (!availableLanguages.some(l => l.code === lang)) {
        throw new Error('Idioma não suportado')
      }

      // Carrega o arquivo de tradução dinamicamente
      await import(`@/locales/${lang}.json`)
      currentLanguage.value = lang
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const translate = (key, params = {}) => {
    return t(key, params)
  }

  // Define o idioma inicial
  setLanguage(currentLanguage.value)

  return {
    currentLanguage,
    loading,
    error,
    availableLanguages,
    setLanguage,
    translate
  }
} 