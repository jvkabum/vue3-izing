import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { api } from 'src/boot/axios'

export function useTag() {
  const $q = useQuasar()
  const store = useStore()
  const loading = ref(false)

  const etiquetas = ref([])
  const etiquetaSelecionada = ref(null)
  const modalEtiqueta = ref(false)

  const etiquetasAtivas = computed(() => {
    return etiquetas.value.filter(tag => tag.isActive)
  })

  const carregarEtiquetas = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/tags')
      etiquetas.value = data
      store.commit('SET_TAGS', data)
      return data
    } catch (error) {
      console.error('Erro ao carregar etiquetas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar etiquetas',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const criarEtiqueta = async (etiqueta) => {
    loading.value = true
    try {
      const { data } = await api.post('/tags', etiqueta)
      
      etiquetas.value.push(data)
      store.commit('ADD_TAG', data)

      $q.notify({
        type: 'positive',
        message: 'Etiqueta criada com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalEtiqueta.value = false
      return data
    } catch (error) {
      console.error('Erro ao criar etiqueta:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar etiqueta',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const atualizarEtiqueta = async (etiqueta) => {
    loading.value = true
    try {
      const { data } = await api.put(`/tags/${etiqueta.id}`, etiqueta)
      
      const index = etiquetas.value.findIndex(t => t.id === etiqueta.id)
      if (index !== -1) {
        etiquetas.value[index] = data
      }

      store.commit('UPDATE_TAG', data)

      $q.notify({
        type: 'positive',
        message: 'Etiqueta atualizada com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalEtiqueta.value = false
      return data
    } catch (error) {
      console.error('Erro ao atualizar etiqueta:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar etiqueta',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const deletarEtiqueta = async (etiquetaId) => {
    try {
      await $q.dialog({
        title: 'Confirmar exclusão',
        message: 'Tem certeza que deseja excluir esta etiqueta?',
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
      await api.delete(`/tags/${etiquetaId}`)
      
      etiquetas.value = etiquetas.value.filter(t => t.id !== etiquetaId)
      store.commit('DELETE_TAG', etiquetaId)

      $q.notify({
        type: 'positive',
        message: 'Etiqueta excluída com sucesso',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      if (error === false) return // Dialog cancelled
      
      console.error('Erro ao deletar etiqueta:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar etiqueta',
        caption: error.message,
        position: 'top'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const abrirModalEtiqueta = (etiqueta = null) => {
    etiquetaSelecionada.value = etiqueta
    modalEtiqueta.value = true
  }

  const fecharModalEtiqueta = () => {
    etiquetaSelecionada.value = null
    modalEtiqueta.value = false
  }

  const salvarEtiqueta = async (etiqueta) => {
    if (etiqueta.id) {
      return await atualizarEtiqueta(etiqueta)
    } else {
      return await criarEtiqueta(etiqueta)
    }
  }

  const getTagColor = (color) => {
    return color || 'grey'
  }

  const getContrastColor = (backgroundColor) => {
    if (!backgroundColor) return 'black'
    
    // Converte a cor para RGB
    let hex = backgroundColor.replace('#', '')
    let r = parseInt(hex.substr(0, 2), 16)
    let g = parseInt(hex.substr(2, 2), 16)
    let b = parseInt(hex.substr(4, 2), 16)

    // Calcula a luminosidade
    let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Retorna branco ou preto baseado na luminosidade
    return luminance > 0.5 ? 'black' : 'white'
  }

  return {
    loading,
    etiquetas,
    etiquetasAtivas,
    etiquetaSelecionada,
    modalEtiqueta,
    carregarEtiquetas,
    criarEtiqueta,
    atualizarEtiqueta,
    deletarEtiqueta,
    abrirModalEtiqueta,
    fecharModalEtiqueta,
    salvarEtiqueta,
    getTagColor,
    getContrastColor
  }
}
