import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from '../../stores/user'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'

/**
 * Composable para gerenciar autenticação
 * @returns {Object} Objeto contendo estados e métodos de autenticação
 */
export function useAuth() {
  const $q = useQuasar()
  const userStore = useUserStore()

  // Estado
  const form = ref({
    email: '',
    password: ''
  })

  const isPwd = ref(true)
  const loading = ref(false)

  /**
   * Regras de validação
   */
  const rules = {
    form: {
      email: { 
        required: required.$message('E-mail é obrigatório'),
        email: email.$message('Deve ser um e-mail válido')
      },
      password: { 
        required: required.$message('Senha é obrigatória')
      }
    }
  }

  const v$ = useVuelidate(rules, { form })

  /**
   * Realiza login
   */
  const fazerLogin = async () => {
    try {
      const isValid = await v$.value.$validate()
      if (!isValid) {
        $q.notify({
          type: 'negative',
          message: 'Informe usuário e senha corretamente.',
          position: 'top',
          timeout: 2000
        })
        return
      }

      loading.value = true
      await userStore.userLogin({
        email: form.value.email,
        password: form.value.password
      })
    } catch (error) {
      console.error('Erro ao realizar login:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao realizar login. Verifique suas credenciais.',
        position: 'top',
        timeout: 2000
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpa cache do navegador
   */
  const clearCache = () => {
    try {
      // Limpa cache do service worker
      if (window.caches) {
        caches.keys().then(names => {
          for (const name of names) {
            caches.delete(name)
          }
        })
      }

      // Limpa storages
      localStorage.clear()
      sessionStorage.clear()

      $q.notify({
        type: 'positive',
        message: 'Cache do navegador limpo.',
        position: 'top',
        timeout: 2000
      })
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao limpar cache.',
        position: 'top',
        timeout: 2000
      })
    }
  }

  return {
    // Estado
    form,
    isPwd,
    loading,
    v$,

    // Métodos
    fazerLogin,
    clearCache
  }
}
