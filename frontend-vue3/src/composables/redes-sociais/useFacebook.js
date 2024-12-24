import { ref, computed } from 'vue'
import api from '@/service/facebook'

export function useFacebook() {
  const paginasFacebook = ref([])
  const carregando = ref(false)
  const erro = ref(null)

  // Estado da conexão
  const conexaoStatus = ref({
    conectado: false,
    token: null,
    expiraEm: null
  })

  // Busca páginas do Facebook
  const buscarPaginas = async () => {
    try {
      carregando.value = true
      erro.value = null
      const response = await api.getPaginas()
      paginasFacebook.value = response.data
    } catch (error) {
      erro.value = error
      console.error('Erro ao buscar páginas:', error)
    } finally {
      carregando.value = false
    }
  }

  // Conecta com Facebook
  const conectarFacebook = async () => {
    try {
      carregando.value = true
      erro.value = null
      const response = await api.conectar()
      conexaoStatus.value = {
        conectado: true,
        token: response.data.token,
        expiraEm: response.data.expiraEm
      }
      return true
    } catch (error) {
      erro.value = error
      console.error('Erro ao conectar com Facebook:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  // Desconecta do Facebook
  const desconectarFacebook = async () => {
    try {
      carregando.value = true
      erro.value = null
      await api.desconectar()
      conexaoStatus.value = {
        conectado: false,
        token: null,
        expiraEm: null
      }
      paginasFacebook.value = []
      return true
    } catch (error) {
      erro.value = error
      console.error('Erro ao desconectar do Facebook:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  // Sincroniza páginas
  const sincronizarPaginas = async () => {
    try {
      carregando.value = true
      erro.value = null
      await api.sincronizarPaginas()
      await buscarPaginas()
      return true
    } catch (error) {
      erro.value = error
      console.error('Erro ao sincronizar páginas:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  // Computed properties
  const temPaginas = computed(() => paginasFacebook.value.length > 0)
  const estaConectado = computed(() => conexaoStatus.value.conectado)

  return {
    paginasFacebook,
    carregando,
    erro,
    conexaoStatus,
    buscarPaginas,
    conectarFacebook,
    desconectarFacebook,
    sincronizarPaginas,
    temPaginas,
    estaConectado
  }
}
