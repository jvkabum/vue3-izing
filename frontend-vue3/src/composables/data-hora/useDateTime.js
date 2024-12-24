import { ref, computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useDataHora () {
  const dataAtual = ref(new Date())

  const formatarData = (data, formatoDesejado = 'dd/MM/yyyy') => {
    if (!data) return ''
    if (typeof data === 'string') {
      data = parseISO(data)
    }
    return format(data, formatoDesejado, { locale: ptBR })
  }

  const formatarHora = (data, formatoDesejado = 'HH:mm') => {
    if (!data) return ''
    if (typeof data === 'string') {
      data = parseISO(data)
    }
    return format(data, formatoDesejado, { locale: ptBR })
  }

  const formatarDataHora = (data, formatoDesejado = 'dd/MM/yyyy HH:mm') => {
    if (!data) return ''
    if (typeof data === 'string') {
      data = parseISO(data)
    }
    return format(data, formatoDesejado, { locale: ptBR })
  }

  const dataFormatada = computed(() => formatarData(dataAtual.value))
  const horaFormatada = computed(() => formatarHora(dataAtual.value))
  const dataHoraFormatada = computed(() => formatarDataHora(dataAtual.value))

  return {
    dataAtual,
    formatarData,
    formatarHora,
    formatarDataHora,
    dataFormatada,
    horaFormatada,
    dataHoraFormatada
  }
}
