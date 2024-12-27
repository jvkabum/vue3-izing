import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from '../stores'

export function useAppConfig() {
  const $q = useQuasar()
  const userStore = useUserStore()
  
  // Estado
  const isDark = ref($q.dark.isActive)
  const configs = ref({
    isDark: isDark.value,
    // Adicione outras configurações aqui
  })

  // Observar mudanças no tema
  watch(isDark, (newValue) => {
    $q.dark.set(newValue)
    updateUserConfigs({ isDark: newValue })
  })

  // Métodos
  const initializeConfigs = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (usuario?.configs) {
      configs.value = { ...configs.value, ...usuario.configs }
      isDark.value = usuario.configs.isDark
      $q.dark.set(isDark.value)
    }
  }

  const updateUserConfigs = async (newConfigs) => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'))
      if (usuario) {
        const updatedConfigs = { ...usuario.configs, ...newConfigs }
        usuario.configs = updatedConfigs
        localStorage.setItem('usuario', JSON.stringify(usuario))
        configs.value = updatedConfigs
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
    }
  }

  const setConfigsUsuario = async (newConfigs) => {
    try {
      await updateUserConfigs(newConfigs)
      if (newConfigs.isDark !== undefined) {
        isDark.value = newConfigs.isDark
      }
    } catch (error) {
      console.error('Erro ao definir configurações:', error)
    }
  }

  // Inicializar configurações
  initializeConfigs()

  return {
    isDark,
    configs,
    setConfigsUsuario,
    updateUserConfigs
  }
}
