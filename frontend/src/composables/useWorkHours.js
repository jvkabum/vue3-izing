import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'
import { format, isWithinInterval, parseISO, isWeekend, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useWorkHours() {
  // Composables
  const $q = useQuasar()
  const { isAdmin } = useAuth()
  const { notify } = useNotification()

  // Estado
  const loading = ref(false)
  const error = ref(null)
  const schedule = ref({
    enabled: true,
    workDays: {
      mon: { enabled: true, start: '09:00', end: '18:00' },
      tue: { enabled: true, start: '09:00', end: '18:00' },
      wed: { enabled: true, start: '09:00', end: '18:00' },
      thu: { enabled: true, start: '09:00', end: '18:00' },
      fri: { enabled: true, start: '09:00', end: '18:00' },
      sat: { enabled: false, start: '09:00', end: '13:00' },
      sun: { enabled: false, start: '09:00', end: '13:00' }
    },
    holidays: [],
    exceptions: [],
    autoReply: {
      enabled: true,
      message: 'Olá! Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.'
    }
  })

  // Computed
  const isBusinessHours = computed(() => {
    if (!schedule.value.enabled) return true

    const now = new Date()
    const day = format(now, 'E').toLowerCase()
    const time = format(now, 'HH:mm')
    
    // Verificar feriados
    const today = format(now, 'yyyy-MM-dd')
    if (schedule.value.holidays.some(h => h.date === today)) {
      return false
    }

    // Verificar exceções
    const exception = schedule.value.exceptions.find(e => e.date === today)
    if (exception) {
      if (!exception.enabled) return false
      return time >= exception.start && time <= exception.end
    }

    // Verificar horário normal
    const workDay = schedule.value.workDays[day]
    if (!workDay?.enabled) return false
    return time >= workDay.start && time <= workDay.end
  })

  const nextBusinessDay = computed(() => {
    let date = addDays(new Date(), 1)
    let attempts = 0
    const maxAttempts = 14 // Evitar loop infinito

    while (attempts < maxAttempts) {
      const dayStr = format(date, 'E').toLowerCase()
      const dateStr = format(date, 'yyyy-MM-dd')
      
      // Verificar feriados
      const isHoliday = schedule.value.holidays.some(h => h.date === dateStr)
      if (isHoliday) {
        date = addDays(date, 1)
        attempts++
        continue
      }

      // Verificar exceções
      const exception = schedule.value.exceptions.find(e => e.date === dateStr)
      if (exception) {
        if (exception.enabled) return date
        date = addDays(date, 1)
        attempts++
        continue
      }

      // Verificar dia normal
      const workDay = schedule.value.workDays[dayStr]
      if (workDay?.enabled) return date
      
      date = addDays(date, 1)
      attempts++
    }

    return null
  })

  const formattedSchedule = computed(() => {
    const days = {
      mon: 'Segunda',
      tue: 'Terça',
      wed: 'Quarta',
      thu: 'Quinta',
      fri: 'Sexta',
      sat: 'Sábado',
      sun: 'Domingo'
    }

    return Object.entries(schedule.value.workDays).map(([day, config]) => ({
      day: days[day],
      ...config,
      formatted: config.enabled
        ? `${config.start} às ${config.end}`
        : 'Fechado'
    }))
  })

  // Métodos
  const loadSchedule = async () => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get('/settings/work-hours')
      schedule.value = data

      return data
    } catch (err) {
      error.value = 'Erro ao carregar horário de funcionamento'
      console.error('Erro ao carregar horário:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSchedule = async (scheduleData) => {
    if (!isAdmin.value) {
      notify({
        type: 'negative',
        message: 'Sem permissão para alterar horário',
        position: 'top'
      })
      return false
    }

    try {
      loading.value = true
      error.value = null

      const { data } = await api.put('/settings/work-hours', scheduleData)
      schedule.value = data

      notify({
        type: 'positive',
        message: 'Horário atualizado com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar horário'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addHoliday = async (holiday) => {
    try {
      const holidays = [...schedule.value.holidays, holiday]
      return updateSchedule({
        ...schedule.value,
        holidays
      })
    } catch (err) {
      error.value = 'Erro ao adicionar feriado'
      throw err
    }
  }

  const removeHoliday = async (date) => {
    try {
      const holidays = schedule.value.holidays.filter(h => h.date !== date)
      return updateSchedule({
        ...schedule.value,
        holidays
      })
    } catch (err) {
      error.value = 'Erro ao remover feriado'
      throw err
    }
  }

  const addException = async (exception) => {
    try {
      const exceptions = [...schedule.value.exceptions, exception]
      return updateSchedule({
        ...schedule.value,
        exceptions
      })
    } catch (err) {
      error.value = 'Erro ao adicionar exceção'
      throw err
    }
  }

  const removeException = async (date) => {
    try {
      const exceptions = schedule.value.exceptions.filter(e => e.date !== date)
      return updateSchedule({
        ...schedule.value,
        exceptions
      })
    } catch (err) {
      error.value = 'Erro ao remover exceção'
      throw err
    }
  }

  const updateAutoReply = async (autoReplyData) => {
    try {
      return updateSchedule({
        ...schedule.value,
        autoReply: {
          ...schedule.value.autoReply,
          ...autoReplyData
        }
      })
    } catch (err) {
      error.value = 'Erro ao atualizar resposta automática'
      throw err
    }
  }

  const isWorkDay = (date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const dayStr = format(dateObj, 'E').toLowerCase()
    const dateStr = format(dateObj, 'yyyy-MM-dd')

    // Verificar feriados
    if (schedule.value.holidays.some(h => h.date === dateStr)) {
      return false
    }

    // Verificar exceções
    const exception = schedule.value.exceptions.find(e => e.date === dateStr)
    if (exception) {
      return exception.enabled
    }

    // Verificar dia normal
    return schedule.value.workDays[dayStr]?.enabled || false
  }

  const getWorkHours = (date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const dayStr = format(dateObj, 'E').toLowerCase()
    const dateStr = format(dateObj, 'yyyy-MM-dd')

    // Verificar exceções
    const exception = schedule.value.exceptions.find(e => e.date === dateStr)
    if (exception) {
      return exception.enabled ? {
        start: exception.start,
        end: exception.end
      } : null
    }

    // Verificar dia normal
    const workDay = schedule.value.workDays[dayStr]
    return workDay?.enabled ? {
      start: workDay.start,
      end: workDay.end
    } : null
  }

  const formatHoliday = (holiday) => {
    return {
      date: holiday.date,
      name: holiday.name,
      formatted: `${format(parseISO(holiday.date), 'PP', { locale: ptBR })} - ${holiday.name}`
    }
  }

  // Lifecycle
  onMounted(() => {
    loadSchedule()
  })

  return {
    // Estado
    schedule,
    loading,
    error,

    // Computed
    isBusinessHours,
    nextBusinessDay,
    formattedSchedule,

    // Métodos
    loadSchedule,
    updateSchedule,
    addHoliday,
    removeHoliday,
    addException,
    removeException,
    updateAutoReply,
    isWorkDay,
    getWorkHours,
    formatHoliday
  }
}
