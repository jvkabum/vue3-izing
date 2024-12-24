import { ref, computed } from 'vue'
import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  addSeconds,
  addMinutes,
  addHours,
  addDays
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useIntervaloTempo () {
  const dataInicial = ref(new Date())
  const dataFinal = ref(new Date())

  const diferencaEmSegundos = computed(() => {
    return differenceInSeconds(dataFinal.value, dataInicial.value)
  })

  const diferencaEmMinutos = computed(() => {
    return differenceInMinutes(dataFinal.value, dataInicial.value)
  })

  const diferencaEmHoras = computed(() => {
    return differenceInHours(dataFinal.value, dataInicial.value)
  })

  const diferencaEmDias = computed(() => {
    return differenceInDays(dataFinal.value, dataInicial.value)
  })

  const adicionarSegundos = (data, quantidade) => {
    return addSeconds(data, quantidade)
  }

  const adicionarMinutos = (data, quantidade) => {
    return addMinutes(data, quantidade)
  }

  const adicionarHoras = (data, quantidade) => {
    return addHours(data, quantidade)
  }

  const adicionarDias = (data, quantidade) => {
    return addDays(data, quantidade)
  }

  const formatarIntervalo = (segundos) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segsRestantes = segundos % 60

    const partes = []
    if (horas > 0) partes.push(`${horas}h`)
    if (minutos > 0) partes.push(`${minutos}m`)
    if (segsRestantes > 0 || partes.length === 0) partes.push(`${segsRestantes}s`)

    return partes.join(' ')
  }

  return {
    dataInicial,
    dataFinal,
    diferencaEmSegundos,
    diferencaEmMinutos,
    diferencaEmHoras,
    diferencaEmDias,
    adicionarSegundos,
    adicionarMinutos,
    adicionarHoras,
    adicionarDias,
    formatarIntervalo
  }
}
