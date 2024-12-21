import { ref, computed } from 'vue'

export function useCorEtiqueta () {
  const coresPadrao = ref([
    { id: 1, nome: 'Vermelho', valor: '#FF4444' },
    { id: 2, nome: 'Verde', valor: '#4CAF50' },
    { id: 3, nome: 'Azul', valor: '#2196F3' },
    { id: 4, nome: 'Amarelo', valor: '#FFEB3B' },
    { id: 5, nome: 'Roxo', valor: '#9C27B0' },
    { id: 6, nome: 'Laranja', valor: '#FF9800' },
    { id: 7, nome: 'Rosa', valor: '#E91E63' },
    { id: 8, nome: 'Ciano', valor: '#00BCD4' }
  ])

  const corSelecionada = ref(null)

  const selecionarCor = (cor) => {
    corSelecionada.value = cor
  }

  const obterCorContraste = (corHex) => {
    // Remove o # se existir
    const hex = corHex.replace('#', '')
    
    // Converte para RGB
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Calcula a luminância
    const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Retorna branco ou preto baseado na luminância
    return luminancia > 0.5 ? '#000000' : '#FFFFFF'
  }

  const corTexto = computed(() => {
    if (!corSelecionada.value) return '#000000'
    return obterCorContraste(corSelecionada.value.valor)
  })

  const gerarCorAleatoria = () => {
    const letras = '0123456789ABCDEF'
    let cor = '#'
    for (let i = 0; i < 6; i++) {
      cor += letras[Math.floor(Math.random() * 16)]
    }
    return cor
  }

  return {
    coresPadrao,
    corSelecionada,
    selecionarCor,
    obterCorContraste,
    corTexto,
    gerarCorAleatoria
  }
}
