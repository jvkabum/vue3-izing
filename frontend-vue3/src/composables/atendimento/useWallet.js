import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { ListarCarteiras, CriarCarteira, AtualizarCarteira, DeletarCarteira } from 'src/service/wallets'

export function useWallet() {
  const $q = useQuasar()
  const store = useStore()
  const loading = ref(false)

  const carteiras = ref([])
  const carteiraSelecionada = ref(null)
  const modalCarteira = ref(false)

  const carteirasAtivas = computed(() => {
    return carteiras.value.filter(wallet => wallet.isActive)
  })

  const carregarCarteiras = async () => {
    loading.value = true
    try {
      const { data } = await ListarCarteiras()
      carteiras.value = data
      store.commit('SET_WALLETS', data)
    } catch (error) {
      console.error('Erro ao carregar carteiras:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar carteiras',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const criarCarteira = async (carteira) => {
    loading.value = true
    try {
      const { data } = await CriarCarteira(carteira)
      
      carteiras.value.push(data)
      store.commit('ADD_WALLET', data)

      $q.notify({
        type: 'positive',
        message: 'Carteira criada com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalCarteira.value = false
    } catch (error) {
      console.error('Erro ao criar carteira:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar carteira',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const atualizarCarteira = async (carteira) => {
    loading.value = true
    try {
      const { data } = await AtualizarCarteira(carteira.id, carteira)
      
      const index = carteiras.value.findIndex(w => w.id === carteira.id)
      if (index !== -1) {
        carteiras.value[index] = data
      }

      store.commit('UPDATE_WALLET', data)

      $q.notify({
        type: 'positive',
        message: 'Carteira atualizada com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalCarteira.value = false
    } catch (error) {
      console.error('Erro ao atualizar carteira:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar carteira',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const deletarCarteira = async (carteiraId) => {
    try {
      await $q.dialog({
        title: 'Confirmar exclusão',
        message: 'Tem certeza que deseja excluir esta carteira?',
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
      await DeletarCarteira(carteiraId)
      
      carteiras.value = carteiras.value.filter(w => w.id !== carteiraId)
      store.commit('DELETE_WALLET', carteiraId)

      $q.notify({
        type: 'positive',
        message: 'Carteira excluída com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      if (error === false) return // Dialog cancelled
      
      console.error('Erro ao deletar carteira:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar carteira',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const abrirModalCarteira = (carteira = null) => {
    carteiraSelecionada.value = carteira
    modalCarteira.value = true
  }

  const fecharModalCarteira = () => {
    carteiraSelecionada.value = null
    modalCarteira.value = false
  }

  const salvarCarteira = async (carteira) => {
    if (carteira.id) {
      await atualizarCarteira(carteira)
    } else {
      await criarCarteira(carteira)
    }
  }

  const atribuirCarteiras = async (contato, carteiras) => {
    loading.value = true
    try {
      const { data } = await AtualizarCarteira(contato.id, {
        wallets: carteiras
      })

      store.commit('UPDATE_CONTACT_WALLETS', {
        contactId: contato.id,
        wallets: data.wallets
      })

      $q.notify({
        type: 'positive',
        message: 'Carteiras atribuídas com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      console.error('Erro ao atribuir carteiras:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atribuir carteiras',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    carteiras,
    carteirasAtivas,
    carteiraSelecionada,
    modalCarteira,
    carregarCarteiras,
    criarCarteira,
    atualizarCarteira,
    deletarCarteira,
    abrirModalCarteira,
    fecharModalCarteira,
    salvarCarteira,
    atribuirCarteiras
  }
}
