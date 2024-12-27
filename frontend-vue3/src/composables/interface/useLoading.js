import { ref, computed } from 'vue'

export function useCarregamento() {
  const carregando = ref(false)
  const mensagemCarregamento = ref('')
  const progresso = ref(0)
  const tempoInicio = ref(null)

  const tempoDecorrido = computed(() => {
    if (!tempoInicio.value || !carregando.value) return 0
    return Math.floor((Date.now() - tempoInicio.value) / 1000)
  })

  const iniciarCarregamento = (mensagem = '') => {
    carregando.value = true
    mensagemCarregamento.value = mensagem
    tempoInicio.value = Date.now()
    progresso.value = 0
  }

  const pararCarregamento = () => {
    carregando.value = false
    mensagemCarregamento.value = ''
    tempoInicio.value = null
    progresso.value = 0
  }

  const atualizarProgresso = (valor) => {
    progresso.value = Math.min(Math.max(0, valor), 100)
  }

  const atualizarMensagem = (mensagem) => {
    mensagemCarregamento.value = mensagem
  }

  return {
    carregando,
    mensagemCarregamento,
    progresso,
    tempoDecorrido,
    iniciarCarregamento,
    pararCarregamento,
    atualizarProgresso,
    atualizarMensagem
  }
}
