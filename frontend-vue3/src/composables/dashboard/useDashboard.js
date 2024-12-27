import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { subDays, format, formatDuration, differenceInDays } from 'date-fns'
import { groupBy } from 'lodash'
import { 
  GetDashTicketsAndTimes,
  GetDashTicketsChannels,
  GetDashTicketsEvolutionChannels,
  GetDashTicketsQueue,
  GetDashTicketsEvolutionByPeriod,
  GetDashTicketsPerUsersDetail
} from '../../service/estatisticas'
import { ListarFilas } from '../../service/filas'

/**
 * Composable para gerenciar o dashboard
 * @returns {Object} Objeto contendo estados e métodos do dashboard
 */
export function useDashboard() {
  const $q = useQuasar()

  // Estado
  const params = ref({
    startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    queuesIds: []
  })

  const filas = ref([])
  const configWidth = ref({
    horizontal: false,
    width: $q.screen.width
  })

  const ticketsAndTimes = ref({
    qtd_total_atendimentos: null,
    qtd_demanda_ativa: null,
    qtd_demanda_receptiva: null,
    new_contacts: null,
    tma: null,
    tme: null
  })

  const ticketsPerUsersDetail = ref([])
  const paginationTableUser = ref({
    rowsPerPage: 40,
    rowsNumber: 0,
    lastIndex: 0
  })

  // Computed
  const tmaFormatted = computed(() => {
    const tma = ticketsAndTimes.value.tma || {}
    return formatDuration(tma) || ''
  })

  const tmeFormatted = computed(() => {
    const tme = ticketsAndTimes.value.tme || {}
    return formatDuration(tme) || ''
  })

  /**
   * Configurações dos gráficos
   */
  const chartConfig = {
    theme: {
      mode: $q.dark.isActive ? 'dark' : 'light',
      palette: 'palette1'
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 1000
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.05,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.9,
        stops: [0, 100]
      }
    }
  }

  /**
   * Atualiza configuração de largura
   */
  const setConfigWidth = () => {
    const diffDays = differenceInDays(
      new Date(params.value.endDate), 
      new Date(params.value.startDate)
    )

    if (diffDays > 30) {
      configWidth.value = { horizontal: true, width: 2200 }
    } else {
      const actualWidth = $q.screen.width
      configWidth.value = { 
        horizontal: true, 
        width: actualWidth - (actualWidth < 768 ? 40 : 100) 
      }
    }
  }

  /**
   * Lista todas as filas
   */
  const listarFilas = async () => {
    try {
      const { data } = await ListarFilas()
      filas.value = data
    } catch (error) {
      console.error('Erro ao listar filas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar filas',
        position: 'top'
      })
    }
  }

  /**
   * Busca dados do dashboard
   */
  const getDashData = async () => {
    try {
      setConfigWidth()

      // Tickets e tempos
      const { data: [ticketsAndTimesData] } = await GetDashTicketsAndTimes(params.value)
      ticketsAndTimes.value = ticketsAndTimesData

      // Tickets por usuário
      const { data: ticketsPerUsers } = await GetDashTicketsPerUsersDetail(params.value)
      ticketsPerUsersDetail.value = ticketsPerUsers

      // Demais dados...
      // Implementar chamadas para outros endpoints conforme necessário

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar dados do dashboard',
        position: 'top'
      })
    }
  }

  return {
    // Estado
    params,
    filas,
    configWidth,
    ticketsAndTimes,
    ticketsPerUsersDetail,
    paginationTableUser,

    // Computed
    tmaFormatted,
    tmeFormatted,

    // Configurações
    chartConfig,

    // Métodos
    setConfigWidth,
    listarFilas,
    getDashData
  }
}
