import { ref, computed } from 'vue'
import api from '@/service/channels'

export function useCanais() {
  const canais = ref([])
  const canalAtivo = ref(null)
  const carregando = ref(false)
  const erro = ref(null)

  // Estados dos canais
  const estadosCanal = {
    CONECTADO: 'CONNECTED',
    DESCONECTADO: 'DISCONNECTED',
    AGUARDANDO: 'PENDING',
    ERRO: 'ERROR'
  }

  // Busca todos os canais
  const buscarCanais = async () => {
    try {
      carregando.value = true
      erro.value = null
      const response = await api.getChannels()
      canais.value = response.data
    } catch (error) {
      erro.value = error
      console.error('Erro ao buscar canais:', error)
    } finally {
      carregando.value = false
    }
  }

  // Ativa um canal
  const ativarCanal = async (canalId) => {
    try {
      carregando.value = true
      erro.value = null
      await api.activateChannel(canalId)
      await buscarCanais()
      return true
    } catch (error) {
      erro.value = error
      console.error('Erro ao ativar canal:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  // Desativa um canal
  const desativarCanal = async (canalId) => {
    try {
      carregando.value = true
      erro.value = null
      await api.deactivateChannel(canalId)
      await buscarCanais()
      return true
    } catch (error) {
      erro.value = error
      console.error('Erro ao desativar canal:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  // Atualiza configurações do canal
  const atualizarCanal = async (canalId, config) => {
    try {
      carregando.value = true
      erro.value = null
      await api.updateChannel(canalId, config)
      await buscarCanais()
      return true
    } catch (error) {
      erro.value = error
      console.error('Erro ao atualizar canal:', error)
      return false
    } finally {
      carregando.value = false
    }
  }

  // Computed properties
  const canaisAtivos = computed(() => 
    canais.value.filter(canal => canal.status === estadosCanal.CONECTADO)
  )

  const canaisInativos = computed(() => 
    canais.value.filter(canal => canal.status === estadosCanal.DESCONECTADO)
  )

  const canaisComErro = computed(() => 
    canais.value.filter(canal => canal.status === estadosCanal.ERRO)
  )

  const canaisPorTipo = computed(() => {
    const agrupados = {}
    canais.value.forEach(canal => {
      if (!agrupados[canal.tipo]) {
        agrupados[canal.tipo] = []
      }
      agrupados[canal.tipo].push(canal)
    })
    return agrupados
  })

  return {
    canais,
    canalAtivo,
    carregando,
    erro,
    estadosCanal,
    buscarCanais,
    ativarCanal,
    desativarCanal,
    atualizarCanal,
    canaisAtivos,
    canaisInativos,
    canaisComErro,
    canaisPorTipo
  }
}
