import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { ListarFilas, CriarFila, AtualizarFila, DeletarFila } from 'src/service/filas'

export function useQueue() {
  const $q = useQuasar()
  const store = useStore()
  const loading = ref(false)

  const filas = ref([])
  const filaSelecionada = ref(null)
  const modalFila = ref(false)

  const filasAtivas = computed(() => {
    return filas.value.filter(fila => fila.isActive)
  })

  const carregarFilas = async () => {
    loading.value = true
    try {
      const { data } = await ListarFilas()
      filas.value = data
      store.commit('SET_FILAS', data)
    } catch (error) {
      console.error('Erro ao carregar filas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar filas',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const criarFila = async (fila) => {
    loading.value = true
    try {
      const { data } = await CriarFila(fila)
      
      filas.value.push(data)
      store.commit('ADD_FILA', data)

      $q.notify({
        type: 'positive',
        message: 'Fila criada com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalFila.value = false
    } catch (error) {
      console.error('Erro ao criar fila:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar fila',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const atualizarFila = async (fila) => {
    loading.value = true
    try {
      const { data } = await AtualizarFila(fila.id, fila)
      
      const index = filas.value.findIndex(f => f.id === fila.id)
      if (index !== -1) {
        filas.value[index] = data
      }

      store.commit('UPDATE_FILA', data)

      $q.notify({
        type: 'positive',
        message: 'Fila atualizada com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalFila.value = false
    } catch (error) {
      console.error('Erro ao atualizar fila:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar fila',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const deletarFila = async (filaId) => {
    try {
      await $q.dialog({
        title: 'Confirmar exclusão',
        message: 'Tem certeza que deseja excluir esta fila?',
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
      await DeletarFila(filaId)
      
      filas.value = filas.value.filter(f => f.id !== filaId)
      store.commit('DELETE_FILA', filaId)

      $q.notify({
        type: 'positive',
        message: 'Fila excluída com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      if (error === false) return // Dialog cancelled
      
      console.error('Erro ao deletar fila:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar fila',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const abrirModalFila = (fila = null) => {
    filaSelecionada.value = fila
    modalFila.value = true
  }

  const fecharModalFila = () => {
    filaSelecionada.value = null
    modalFila.value = false
  }

  const salvarFila = async (fila) => {
    if (fila.id) {
      await atualizarFila(fila)
    } else {
      await criarFila(fila)
    }
  }

  return {
    loading,
    filas,
    filasAtivas,
    filaSelecionada,
    modalFila,
    carregarFilas,
    criarFila,
    atualizarFila,
    deletarFila,
    abrirModalFila,
    fecharModalFila,
    salvarFila
  }
}
