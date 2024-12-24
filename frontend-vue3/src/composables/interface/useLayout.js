import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useLayout() {
  // Estado do layout
  const menuLateralAberto = ref(true)
  const menuLateralMini = ref(false)
  const barraTopoAltura = ref(64)
  const menuLateralLargura = ref(256)
  const menuLateralMiniLargura = ref(64)

  // Dimensões do container principal
  const containerDimensoes = ref({
    largura: 0,
    altura: 0
  })

  // Configurações de grid
  const gridConfig = ref({
    colunas: 12,
    espacamento: 16,
    margemLateral: 24
  })

  // Calcula largura disponível para conteúdo
  const larguraConteudo = computed(() => {
    const larguraMenu = menuLateralAberto.value
      ? (menuLateralMini.value ? menuLateralMiniLargura.value : menuLateralLargura.value)
      : 0
    return containerDimensoes.value.largura - larguraMenu
  })

  // Calcula altura disponível para conteúdo
  const alturaConteudo = computed(() => {
    return containerDimensoes.value.altura - barraTopoAltura.value
  })

  // Calcula largura de uma coluna do grid
  const larguraColuna = computed(() => {
    const espacamentoTotal = gridConfig.value.espacamento * (gridConfig.value.colunas - 1)
    const larguraDisponivel = larguraConteudo.value - (2 * gridConfig.value.margemLateral) - espacamentoTotal
    return larguraDisponivel / gridConfig.value.colunas
  })

  // Controle do menu lateral
  const alternarMenuLateral = () => {
    menuLateralAberto.value = !menuLateralAberto.value
  }

  const alternarMenuMini = () => {
    menuLateralMini.value = !menuLateralMini.value
  }

  // Atualiza dimensões do container
  const atualizarDimensoes = () => {
    const container = document.getElementById('app-container')
    if (container) {
      containerDimensoes.value = {
        largura: container.clientWidth,
        altura: container.clientHeight
      }
    }
  }

  // Calcula dimensões para um número específico de colunas
  const calcularLarguraColunas = (numeroColunas) => {
    const larguraTotal = (larguraColuna.value * numeroColunas) +
      (gridConfig.value.espacamento * (numeroColunas - 1))
    return `${larguraTotal}px`
  }

  // Event listeners
  onMounted(() => {
    atualizarDimensoes()
    window.addEventListener('resize', atualizarDimensoes)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', atualizarDimensoes)
  })

  return {
    menuLateralAberto,
    menuLateralMini,
    barraTopoAltura,
    menuLateralLargura,
    menuLateralMiniLargura,
    containerDimensoes,
    gridConfig,
    larguraConteudo,
    alturaConteudo,
    larguraColuna,
    alternarMenuLateral,
    alternarMenuMini,
    calcularLarguraColunas
  }
}
