import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { api } from 'src/boot/axios'
import { format, parseISO, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useSchedule() {
  const $q = useQuasar()
  const store = useStore()
  const loading = ref(false)

  const agendamentos = ref([])
  const agendamentoSelecionado = ref(null)
  const modalAgendamento = ref(false)

  const agendamentosAtivos = computed(() => {
    return agendamentos.value.filter(schedule => {
      const scheduleDate = parseISO(schedule.scheduleDate)
      return isAfter(scheduleDate, new Date()) && schedule.status === 'pending'
    })
  })

  const carregarAgendamentos = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/schedules')
      agendamentos.value = data
      store.commit('SET_SCHEDULES', data)
      return data
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar agendamentos',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const criarAgendamento = async (agendamento) => {
    loading.value = true
    try {
      const { data } = await api.post('/schedules', agendamento)
      
      agendamentos.value.push(data)
      store.commit('ADD_SCHEDULE', data)

      $q.notify({
        type: 'positive',
        message: 'Agendamento criado com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalAgendamento.value = false
      return data
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar agendamento',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const atualizarAgendamento = async (agendamento) => {
    loading.value = true
    try {
      const { data } = await api.put(`/schedules/${agendamento.id}`, agendamento)
      
      const index = agendamentos.value.findIndex(s => s.id === agendamento.id)
      if (index !== -1) {
        agendamentos.value[index] = data
      }

      store.commit('UPDATE_SCHEDULE', data)

      $q.notify({
        type: 'positive',
        message: 'Agendamento atualizado com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalAgendamento.value = false
      return data
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar agendamento',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const deletarAgendamento = async (agendamentoId) => {
    try {
      await $q.dialog({
        title: 'Confirmar exclusão',
        message: 'Tem certeza que deseja excluir este agendamento?',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      })

      loading.value = true
      await api.delete(`/schedules/${agendamentoId}`)
      
      agendamentos.value = agendamentos.value.filter(s => s.id !== agendamentoId)
      store.commit('DELETE_SCHEDULE', agendamentoId)

      $q.notify({
        type: 'positive',
        message: 'Agendamento excluído com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      if (error === false) return // Dialog cancelled
      
      console.error('Erro ao deletar agendamento:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar agendamento',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const abrirModalAgendamento = (agendamento = null) => {
    agendamentoSelecionado.value = agendamento
    modalAgendamento.value = true
  }

  const fecharModalAgendamento = () => {
    agendamentoSelecionado.value = null
    modalAgendamento.value = false
  }

  const salvarAgendamento = async (agendamento) => {
    if (agendamento.id) {
      return await atualizarAgendamento(agendamento)
    } else {
      return await criarAgendamento(agendamento)
    }
  }

  const formatarDataAgendamento = (data) => {
    if (!data) return ''
    return format(parseISO(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'sent':
        return 'positive'
      case 'canceled':
        return 'negative'
      default:
        return 'grey'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'sent':
        return 'Enviado'
      case 'canceled':
        return 'Cancelado'
      default:
        return 'Desconhecido'
    }
  }

  return {
    loading,
    agendamentos,
    agendamentosAtivos,
    agendamentoSelecionado,
    modalAgendamento,
    carregarAgendamentos,
    criarAgendamento,
    atualizarAgendamento,
    deletarAgendamento,
    abrirModalAgendamento,
    fecharModalAgendamento,
    salvarAgendamento,
    formatarDataAgendamento,
    getStatusColor,
    getStatusLabel
  }
}
