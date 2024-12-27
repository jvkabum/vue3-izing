import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { api } from 'src/boot/axios'

export function useNovoTicket() {
  const router = useRouter()
  const $q = useQuasar()
  const store = useStore()

  const userId = +localStorage.getItem('userId')
  const ticket = ref({})
  const contatoSelecionado = ref(null)
  const contatos = ref([])
  const modalContato = ref(false)
  const loading = ref(false)

  const fecharModal = (emit) => {
    ticket.value = {}
    contatoSelecionado.value = null
    emit('update:modalNovoTicket', false)
  }

  const localizarContato = async (search, update, abort) => {
    if (search.length < 2) {
      if (contatos.value.length) {
        update(() => { contatos.value = [...contatos.value] })
      }
      abort()
      return
    }

    loading.value = true
    try {
      const { data } = await api.get('/contacts', {
        params: { searchParam: search }
      })

      update(() => {
        if (data.contacts.length) {
          contatos.value = data.contacts
        } else {
          contatos.value = [{}]
        }
      })
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao buscar contatos',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  const contatoCriadoNotoTicket = (contato) => {
    contatoSelecionado.value = contato
    criarTicket()
  }

  const criarTicket = async (emit) => {
    if (!contatoSelecionado.value?.id) return

    loading.value = true
    try {
      const { data: ticketData } = await api.post('/tickets', {
        contactId: contatoSelecionado.value.id,
        isActiveDemand: true,
        userId,
        status: 'open'
      })

      await store.commit('SET_HAS_MORE', true)
      await store.dispatch('AbrirChatMensagens', ticketData)

      $q.notify({
        message: `Atendimento Iniciado || ${ticketData.contact.name} - Ticket: ${ticketData.id}`,
        type: 'positive',
        progress: true,
        position: 'top',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })

      fecharModal(emit)

      if (router.currentRoute.value.name !== 'atendimento') {
        router.push({ name: 'atendimento' })
      }

      return ticketData
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Ocorreu um erro ao iniciar o atendimento!',
        caption: error.message
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const abrirModalContato = () => {
    modalContato.value = true
  }

  const fecharModalContato = () => {
    modalContato.value = false
  }

  return {
    ticket,
    contatoSelecionado,
    contatos,
    modalContato,
    loading,
    fecharModal,
    localizarContato,
    contatoCriadoNotoTicket,
    criarTicket,
    abrirModalContato,
    fecharModalContato
  }
}
