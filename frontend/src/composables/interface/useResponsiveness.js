import { ref, onMounted, onUnmounted, computed } from 'vue'

export function useResponsividade() {
  const larguraTela = ref(window.innerWidth)
  const alturaTela = ref(window.innerHeight)

  // Pontos de quebra padrão
  const breakpoints = {
    xs: 600,
    sm: 960,
    md: 1264,
    lg: 1904
  }

  // Atualiza dimensões quando a janela é redimensionada
  const atualizarDimensoes = () => {
    larguraTela.value = window.innerWidth
    alturaTela.value = window.innerHeight
  }

  // Computed properties para cada breakpoint
  const ehMobile = computed(() => larguraTela.value < breakpoints.sm)
  const ehTablet = computed(() => larguraTela.value >= breakpoints.sm && larguraTela.value < breakpoints.md)
  const ehDesktop = computed(() => larguraTela.value >= breakpoints.md && larguraTela.value < breakpoints.lg)
  const ehTelaGrande = computed(() => larguraTela.value >= breakpoints.lg)

  // Orientação da tela
  const ehOrientacaoRetrato = computed(() => alturaTela.value > larguraTela.value)
  const ehOrientacaoPaisagem = computed(() => larguraTela.value > alturaTela.value)

  // Adiciona e remove event listener
  onMounted(() => {
    window.addEventListener('resize', atualizarDimensoes)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', atualizarDimensoes)
  })

  // Função para verificar se a largura está acima de um determinado breakpoint
  const acimaDe = (breakpoint) => {
    if (typeof breakpoint === 'number') {
      return larguraTela.value >= breakpoint
    }
    return larguraTela.value >= breakpoints[breakpoint]
  }

  // Função para verificar se a largura está abaixo de um determinado breakpoint
  const abaixoDe = (breakpoint) => {
    if (typeof breakpoint === 'number') {
      return larguraTela.value < breakpoint
    }
    return larguraTela.value < breakpoints[breakpoint]
  }

  return {
    larguraTela,
    alturaTela,
    breakpoints,
    ehMobile,
    ehTablet,
    ehDesktop,
    ehTelaGrande,
    ehOrientacaoRetrato,
    ehOrientacaoPaisagem,
    acimaDe,
    abaixoDe
  }
}
