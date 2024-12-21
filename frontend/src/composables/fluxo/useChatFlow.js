import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/service/api'
import { useNotification } from '@/composables/sistema/useNotification'

export function useFluxoChat() {
  const $q = useQuasar()
  const { notify } = useNotification()

  // Estado
  const fluxos = ref([])
  const fluxoAtivo = ref(null)
  const carregando = ref(false)
  const erro = ref(null)
  const execucaoAtual = ref(null)

  // Computed Properties
  const fluxosAtivos = computed(() => 
    fluxos.value.filter(f => f.ativo)
  )

  const fluxosPorTipo = computed(() => {
    const agrupados = {
      atendimento: [],
      respostaAutomatica: [],
      campanha: [],
      integracao: []
    }
    fluxos.value.forEach(fluxo => {
      if (fluxo.tipo in agrupados) {
        agrupados[fluxo.tipo].push(fluxo)
      }
    })
    return agrupados
  })

  // Métodos
  const buscarFluxos = async () => {
    try {
      carregando.value = true
      erro.value = null
      const response = await api.get('/fluxos-chat')
      fluxos.value = response.data
      return response.data
    } catch (error) {
      erro.value = 'Erro ao buscar fluxos'
      console.error('Erro ao buscar fluxos:', error)
      throw error
    } finally {
      carregando.value = false
    }
  }

  const criarFluxo = async (dados) => {
    try {
      carregando.value = true
      erro.value = null
      const response = await api.post('/fluxos-chat', dados)
      fluxos.value.push(response.data)
      notify({
        type: 'positive',
        message: 'Fluxo criado com sucesso',
        position: 'top'
      })
      return response.data
    } catch (error) {
      erro.value = 'Erro ao criar fluxo'
      console.error('Erro ao criar fluxo:', error)
      throw error
    } finally {
      carregando.value = false
    }
  }

  const atualizarFluxo = async (id, dados) => {
    try {
      carregando.value = true
      erro.value = null
      const response = await api.put(`/fluxos-chat/${id}`, dados)
      const index = fluxos.value.findIndex(f => f.id === id)
      if (index !== -1) {
        fluxos.value[index] = response.data
      }
      notify({
        type: 'positive',
        message: 'Fluxo atualizado com sucesso',
        position: 'top'
      })
      return response.data
    } catch (error) {
      erro.value = 'Erro ao atualizar fluxo'
      console.error('Erro ao atualizar fluxo:', error)
      throw error
    } finally {
      carregando.value = false
    }
  }

  const deletarFluxo = async (id) => {
    try {
      carregando.value = true
      erro.value = null
      await api.delete(`/fluxos-chat/${id}`)
      fluxos.value = fluxos.value.filter(f => f.id !== id)
      notify({
        type: 'positive',
        message: 'Fluxo removido com sucesso',
        position: 'top'
      })
      return true
    } catch (error) {
      erro.value = 'Erro ao deletar fluxo'
      console.error('Erro ao deletar fluxo:', error)
      throw error
    } finally {
      carregando.value = false
    }
  }

  const executarFluxo = async (fluxoId, contexto = {}) => {
    try {
      carregando.value = true
      erro.value = null
      execucaoAtual.value = {
        fluxoId,
        inicio: new Date(),
        status: 'executando'
      }

      const response = await api.post(`/fluxos-chat/${fluxoId}/executar`, contexto)
      
      execucaoAtual.value = {
        ...execucaoAtual.value,
        fim: new Date(),
        status: 'concluido',
        resultado: response.data
      }

      return response.data
    } catch (error) {
      erro.value = 'Erro ao executar fluxo'
      execucaoAtual.value = {
        ...execucaoAtual.value,
        fim: new Date(),
        status: 'erro',
        erro: error
      }
      console.error('Erro ao executar fluxo:', error)
      throw error
    } finally {
      carregando.value = false
    }
  }

  const validarFluxo = async (dados) => {
    try {
      carregando.value = true
      erro.value = null
      const response = await api.post('/fluxos-chat/validar', dados)
      return response.data
    } catch (error) {
      erro.value = 'Erro ao validar fluxo'
      console.error('Erro ao validar fluxo:', error)
      throw error
    } finally {
      carregando.value = false
    }
  }

  const importarFluxo = async (arquivo) => {
    try {
      carregando.value = true
      erro.value = null

      const formData = new FormData()
      formData.append('arquivo', arquivo)

      const response = await api.post('/fluxos-chat/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      fluxos.value.push(response.data)
      notify({
        type: 'positive',
        message: 'Fluxo importado com sucesso',
        position: 'top'
      })

      return response.data
    } catch (error) {
      erro.value = 'Erro ao importar fluxo'
      console.error('Erro ao importar fluxo:', error)
      throw error
    } finally {
      carregando.value = false
    }
  }

  const exportarFluxo = async (id) => {
    try {
      carregando.value = true
      erro.value = null
      
      const response = await api.get(`/fluxos-chat/${id}/exportar`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `fluxo-${id}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      return true
    } catch (error) {
      erro.value = 'Erro ao exportar fluxo'
      console.error('Erro ao exportar fluxo:', error)
      throw error
    } finally {
      carregando.value = false
    }
  }

  return {
    // Estado
    fluxos,
    fluxoAtivo,
    carregando,
    erro,
    execucaoAtual,

    // Computed
    fluxosAtivos,
    fluxosPorTipo,

    // Métodos
    buscarFluxos,
    criarFluxo,
    atualizarFluxo,
    deletarFluxo,
    executarFluxo,
    validarFluxo,
    importarFluxo,
    exportarFluxo
  }
}
