import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useNavegacao() {
  const router = useRouter()
  const route = useRoute()
  
  const historicoNavegacao = ref([])
  const rotaAnterior = ref(null)

  // Guarda informações da rota atual
  const rotaAtual = computed(() => ({
    nome: route.name,
    caminho: route.path,
    parametros: route.params,
    query: route.query
  }))

  // Adiciona rota ao histórico
  const adicionarAoHistorico = (rota) => {
    historicoNavegacao.value.push({
      ...rota,
      timestamp: Date.now()
    })
  }

  // Navega para uma rota
  const navegarPara = async (destino, opcoes = {}) => {
    try {
      rotaAnterior.value = { ...rotaAtual.value }
      await router.push({
        name: destino,
        params: opcoes.params || {},
        query: opcoes.query || {}
      })
      adicionarAoHistorico(rotaAtual.value)
      return true
    } catch (erro) {
      console.error('Erro na navegação:', erro)
      return false
    }
  }

  // Volta para a página anterior
  const voltarPagina = async () => {
    try {
      await router.back()
      return true
    } catch (erro) {
      console.error('Erro ao voltar página:', erro)
      return false
    }
  }

  // Limpa o histórico de navegação
  const limparHistorico = () => {
    historicoNavegacao.value = []
  }

  // Verifica se pode voltar
  const podeVoltar = computed(() => historicoNavegacao.value.length > 0)

  return {
    rotaAtual,
    rotaAnterior,
    historicoNavegacao,
    navegarPara,
    voltarPagina,
    limparHistorico,
    podeVoltar
  }
}
