import { ref, computed, onMounted } from 'vue'

export function useAcessibilidade() {
  // Estados de acessibilidade
  const altoContraste = ref(false)
  const tamanhoFonte = ref(16) // tamanho base em pixels
  const leitorTela = ref(false)
  const reducaoMovimento = ref(false)
  const navegacaoTeclado = ref(true)

  // Preferências do sistema
  const prefereReducaoMovimento = ref(false)
  const prefereAltoContraste = ref(false)

  // Verifica preferências do sistema
  onMounted(() => {
    if (window.matchMedia) {
      // Verifica preferência por redução de movimento
      const mediaQueryMovimento = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefereReducaoMovimento.value = mediaQueryMovimento.matches
      reducaoMovimento.value = mediaQueryMovimento.matches

      // Verifica preferência por alto contraste
      const mediaQueryContraste = window.matchMedia('(prefers-contrast: more)')
      prefereAltoContraste.value = mediaQueryContraste.matches
      altoContraste.value = mediaQueryContraste.matches

      // Observa mudanças nas preferências
      mediaQueryMovimento.addEventListener('change', (e) => {
        prefereReducaoMovimento.value = e.matches
        if (!localStorage.getItem('reducao-movimento')) {
          reducaoMovimento.value = e.matches
        }
      })

      mediaQueryContraste.addEventListener('change', (e) => {
        prefereAltoContraste.value = e.matches
        if (!localStorage.getItem('alto-contraste')) {
          altoContraste.value = e.matches
        }
      })
    }
  })

  // Ajusta o tamanho da fonte
  const ajustarTamanhoFonte = (tamanho) => {
    tamanhoFonte.value = Math.min(Math.max(12, tamanho), 24) // limita entre 12px e 24px
    document.documentElement.style.fontSize = `${tamanhoFonte.value}px`
    localStorage.setItem('tamanho-fonte', tamanhoFonte.value)
  }

  // Aumenta o tamanho da fonte
  const aumentarFonte = () => {
    ajustarTamanhoFonte(tamanhoFonte.value + 2)
  }

  // Diminui o tamanho da fonte
  const diminuirFonte = () => {
    ajustarTamanhoFonte(tamanhoFonte.value - 2)
  }

  // Alterna alto contraste
  const alternarAltoContraste = () => {
    altoContraste.value = !altoContraste.value
    document.documentElement.classList.toggle('alto-contraste', altoContraste.value)
    localStorage.setItem('alto-contraste', altoContraste.value)
  }

  // Alterna redução de movimento
  const alternarReducaoMovimento = () => {
    reducaoMovimento.value = !reducaoMovimento.value
    document.documentElement.classList.toggle('reduzir-movimento', reducaoMovimento.value)
    localStorage.setItem('reducao-movimento', reducaoMovimento.value)
  }

  // Alterna navegação por teclado
  const alternarNavegacaoTeclado = () => {
    navegacaoTeclado.value = !navegacaoTeclado.value
    document.documentElement.classList.toggle('navegacao-teclado', navegacaoTeclado.value)
    localStorage.setItem('navegacao-teclado', navegacaoTeclado.value)
  }

  // Classes CSS computadas baseadas no estado atual
  const classesAcessibilidade = computed(() => ({
    'alto-contraste': altoContraste.value,
    'reduzir-movimento': reducaoMovimento.value,
    'navegacao-teclado': navegacaoTeclado.value
  }))

  return {
    altoContraste,
    tamanhoFonte,
    leitorTela,
    reducaoMovimento,
    navegacaoTeclado,
    prefereReducaoMovimento,
    prefereAltoContraste,
    ajustarTamanhoFonte,
    aumentarFonte,
    diminuirFonte,
    alternarAltoContraste,
    alternarReducaoMovimento,
    alternarNavegacaoTeclado,
    classesAcessibilidade
  }
}
