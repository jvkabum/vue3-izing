import { ref, computed } from 'vue'
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'

export function useFusoHorario () {
  const fusoHorarioLocal = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)

  const converterParaUTC = (data, fusoHorario = fusoHorarioLocal.value) => {
    if (!data) return null
    return zonedTimeToUtc(data, fusoHorario)
  }

  const converterDaUTC = (data, fusoHorario = fusoHorarioLocal.value) => {
    if (!data) return null
    return utcToZonedTime(data, fusoHorario)
  }

  const formatarComFuso = (data, formatoDesejado = 'dd/MM/yyyy HH:mm zzz', fusoHorario = fusoHorarioLocal.value) => {
    if (!data) return ''
    const dataNoFuso = utcToZonedTime(data, fusoHorario)
    return format(dataNoFuso, formatoDesejado, { timeZone: fusoHorario, locale: ptBR })
  }

  const fusoHorarioAtual = computed(() => {
    const data = new Date()
    return format(data, 'zzz', { timeZone: fusoHorarioLocal.value })
  })

  return {
    fusoHorarioLocal,
    converterParaUTC,
    converterDaUTC,
    formatarComFuso,
    fusoHorarioAtual
  }
}
