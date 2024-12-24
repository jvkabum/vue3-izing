import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/service/api'

export function useAuth() {
  const router = useRouter()
  
  // Estado
  const usuario = ref(null)
  const token = ref(null)
  const carregando = ref(false)
  const erro = ref(null)

  // Computed properties
  const estaAutenticado = computed(() => !!token.value)
  const isAdmin = computed(() => usuario.value?.profile === 'admin')

  // Métodos
  const login = async (credenciais) => {
    try {
      carregando.value = true
      erro.value = null

      const { data } = await api.post('/auth/login', credenciais)
      
      token.value = data.token
      usuario.value = data.user
      
      localStorage.setItem('token', JSON.stringify(data.token))
      localStorage.setItem('usuario', JSON.stringify(data.user))
      
      api.defaults.headers.Authorization = `Bearer ${data.token}`
      
      router.push({ name: 'dashboard' })
      return true
    } catch (error) {
      erro.value = error.response?.data?.message || 'Erro ao fazer login'
      console.error('Erro no login:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  const logout = async () => {
    try {
      carregando.value = true
      erro.value = null

      await api.post('/auth/logout')
      
      token.value = null
      usuario.value = null
      
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      
      delete api.defaults.headers.Authorization
      
      router.push({ name: 'login' })
      return true
    } catch (error) {
      erro.value = 'Erro ao fazer logout'
      console.error('Erro no logout:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  const verificarAutenticacao = () => {
    const tokenSalvo = localStorage.getItem('token')
    const usuarioSalvo = localStorage.getItem('usuario')

    if (tokenSalvo && usuarioSalvo) {
      token.value = JSON.parse(tokenSalvo)
      usuario.value = JSON.parse(usuarioSalvo)
      api.defaults.headers.Authorization = `Bearer ${token.value}`
      return true
    }

    return false
  }

  const atualizarPerfil = async (dados) => {
    try {
      carregando.value = true
      erro.value = null

      const { data } = await api.put('/auth/profile', dados)
      
      usuario.value = data
      localStorage.setItem('usuario', JSON.stringify(data))
      
      return true
    } catch (error) {
      erro.value = 'Erro ao atualizar perfil'
      console.error('Erro ao atualizar perfil:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  const alterarSenha = async (senhas) => {
    try {
      carregando.value = true
      erro.value = null

      await api.put('/auth/password', senhas)
      return true
    } catch (error) {
      erro.value = error.response?.data?.message || 'Erro ao alterar senha'
      console.error('Erro ao alterar senha:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  const recuperarSenha = async (email) => {
    try {
      carregando.value = true
      erro.value = null

      await api.post('/auth/forgot-password', { email })
      return true
    } catch (error) {
      erro.value = 'Erro ao solicitar recuperação de senha'
      console.error('Erro na recuperação de senha:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  const redefinirSenha = async (token, novaSenha) => {
    try {
      carregando.value = true
      erro.value = null

      await api.post('/auth/reset-password', {
        token,
        password: novaSenha
      })
      return true
    } catch (error) {
      erro.value = 'Erro ao redefinir senha'
      console.error('Erro ao redefinir senha:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  return {
    // Estado
    usuario,
    token,
    carregando,
    erro,
    
    // Computed
    estaAutenticado,
    isAdmin,
    
    // Métodos
    login,
    logout,
    verificarAutenticacao,
    atualizarPerfil,
    alterarSenha,
    recuperarSenha,
    redefinirSenha
  }
}
