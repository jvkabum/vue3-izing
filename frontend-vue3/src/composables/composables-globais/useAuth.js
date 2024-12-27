import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { api } from 'src/boot/axios'

export function useAuth() {
  const $q = useQuasar()
  const store = useStore()
  const router = useRouter()

  const loading = ref(false)
  const usuario = ref(null)
  const token = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => usuario.value?.profile === 'admin')

  const login = async (credentials) => {
    loading.value = true
    try {
      const { data } = await api.post('/auth/login', credentials)
      
      token.value = data.token
      usuario.value = data.usuario

      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      localStorage.setItem('userId', data.usuario.id)
      localStorage.setItem('username', data.usuario.name)

      store.commit('SET_USER', data.usuario)

      $q.notify({
        type: 'positive',
        message: 'Login realizado com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      router.push({ name: 'atendimento' })
      return data
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao fazer login',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await api.post('/auth/logout')
      
      token.value = null
      usuario.value = null

      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')

      store.commit('RESET_USER')
      store.commit('RESET_STATE')

      router.push({ name: 'login' })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao fazer logout',
        caption: error.message,
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  const checkAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('usuario')

    if (storedToken && storedUser) {
      token.value = storedToken
      usuario.value = JSON.parse(storedUser)
      store.commit('SET_USER', usuario.value)
      return true
    }

    return false
  }

  const updateProfile = async (profile) => {
    if (!usuario.value) return

    try {
      loading.value = true
      const { data } = await api.put(`/users/${usuario.value.id}`, profile)
      
      usuario.value = {
        ...usuario.value,
        ...data
      }

      localStorage.setItem('usuario', JSON.stringify(usuario.value))
      store.commit('SET_USER', usuario.value)

      $q.notify({
        type: 'positive',
        message: 'Perfil atualizado com sucesso',
        position: 'top'
      })

      return data
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar perfil',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const refreshToken = async () => {
    try {
      const { data } = await api.post('/auth/refresh')
      token.value = data.token
      localStorage.setItem('token', data.token)
      return data
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      logout()
      throw error
    }
  }

  return {
    loading,
    usuario,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    checkAuth,
    updateProfile,
    refreshToken
  }
}
