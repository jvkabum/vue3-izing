import { ref, computed } from 'vue'

export function useGerenciadorEtiquetas () {
  const etiquetasSelecionadas = ref([])
  const etiquetasDisponiveis = ref([])

  const adicionarEtiqueta = (etiqueta) => {
    if (!etiquetasSelecionadas.value.find(e => e.id === etiqueta.id)) {
      etiquetasSelecionadas.value.push(etiqueta)
    }
  }

  const removerEtiqueta = (etiquetaId) => {
    etiquetasSelecionadas.value = etiquetasSelecionadas.value.filter(e => e.id !== etiquetaId)
  }

  const limparEtiquetas = () => {
    etiquetasSelecionadas.value = []
  }

  const etiquetasOrdenadas = computed(() => {
    return [...etiquetasSelecionadas.value].sort((a, b) => a.nome.localeCompare(b.nome))
  })

  const buscarEtiquetas = (termo) => {
    if (!termo) return etiquetasDisponiveis.value
    const termoLowerCase = termo.toLowerCase()
    return etiquetasDisponiveis.value.filter(e => 
      e.nome.toLowerCase().includes(termoLowerCase)
    )
  }

  return {
    etiquetasSelecionadas,
    etiquetasDisponiveis,
    adicionarEtiqueta,
    removerEtiqueta,
    limparEtiquetas,
    etiquetasOrdenadas,
    buscarEtiquetas
  }
}
