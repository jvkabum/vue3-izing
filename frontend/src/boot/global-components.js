import { boot } from 'quasar/wrappers'
import { useAppConfig } from '../composables/useAppConfig'

// Componentes globais
import ErrorBoundary from '../components/ErrorBoundary.vue'
import cInput from '../components/cInput.vue'
import cDateTimePick from '../components/cDateTimePick.vue'
import cDatePick from '../components/cDatePick.vue'
import cStatusUsuario from '../components/cStatusUsuario.vue'
import cSystemVersion from '../components/cSystemVersion.vue'

// Helpers globais
const iniciaisString = (str) => {
  if (!str) return ''
  return str
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

const notificarErro = (message, error) => {
  console.error(message, error)
  return {
    type: 'negative',
    message: `${message}: ${error.message || error}`,
    position: 'top'
  }
}

export default boot(({ app }) => {
  // Registrar componentes globais
  app.component('ErrorBoundary', ErrorBoundary)
  app.component('cInput', cInput)
  app.component('cDateTimePick', cDateTimePick)
  app.component('cDatePick', cDatePick)
  app.component('cStatusUsuario', cStatusUsuario)
  app.component('cSystemVersion', cSystemVersion)

  // Registrar helpers globais
  app.config.globalProperties.$iniciaisString = iniciaisString
  app.config.globalProperties.$notificarErro = notificarErro

  // Inicializar configurações do app
  const { setConfigsUsuario } = useAppConfig()
  app.config.globalProperties.$setConfigsUsuario = setConfigsUsuario
})

// Exportar helpers para uso em composables
export { iniciaisString, notificarErro }
