import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

export function useAuth() {
  const loading = ref(false)
  const router = useRouter()
  const userStore = useUserStore()

  const fazerLogin = async (form) => {
    try {
      loading.value = true
      await userStore.login(form)
      loading.value = false
      router.push({ name: 'dashboard' })
    } catch (err) {
      console.error('Erro no login:', err)
      loading.value = false
      throw err
    }
  }

  return {
    loading,
    fazerLogin
  }
}
