import { ref, watch } from 'vue'

export function useModoEscuro() {
  const modoEscuro = ref(false)
  const preferenciaSistema = ref(false)

  // Verifica a preferência do sistema
  const verificarPreferenciaSistema = () => {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      preferenciaSistema.value = mediaQuery.matches
      return mediaQuery.matches
    }
    return false
  }

  // Aplica o modo escuro
  const aplicarModoEscuro = (ativo) => {
    modoEscuro.value = ativo
    document.documentElement.classList.toggle('modo-escuro', ativo)
    localStorage.setItem('modo-escuro', ativo ? 'true' : 'false')
  }

  // Alterna entre modo claro e escuro
  const alternarModoEscuro = () => {
    aplicarModoEscuro(!modoEscuro.value)
  }

  // Inicializa o modo escuro baseado na preferência salva ou do sistema
  const inicializarModoEscuro = () => {
    const preferenciaSalva = localStorage.getItem('modo-escuro')
    if (preferenciaSalva !== null) {
      aplicarModoEscuro(preferenciaSalva === 'true')
    } else {
      aplicarModoEscuro(verificarPreferenciaSistema())
    }
  }

  // Observa mudanças na preferência do sistema
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      preferenciaSistema.value = e.matches
      if (localStorage.getItem('modo-escuro') === null) {
        aplicarModoEscuro(e.matches)
      }
    })
  }

  // Inicializa ao montar o componente
  inicializarModoEscuro()

  return {
    modoEscuro,
    preferenciaSistema,
    alternarModoEscuro,
    aplicarModoEscuro
  }
}
