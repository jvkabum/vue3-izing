import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { useRouter } from 'vue-router'
import { ListarUsuarios } from 'src/service/user'
import { ListarFilas } from 'src/service/filas'
import { AtualizarTicket } from 'src/service/tickets'

export function useInforCabecalhoChat() {
  const $q = useQuasar()
  const store = useStore()
  const router = useRouter()

  const userId = +localStorage.getItem('userId')
  const menuVisible = ref(false)
  const modalTransferirTicket = ref(false)
  const usuarioSelecionado = ref(null)
  const filaSelecionada = ref(null)
  const usuarios = ref([])
  const filas = ref([])

  const ticketFocado = computed(() => store.getters.ticketFocado)

  const cticket = computed(() => {
    const infoDefault = {
      contact: { profilePicUrl: '', name: '' },
      user: { name: '' }
    }
    return Object.keys(ticketFocado.value).includes('contact') ? ticketFocado.value : infoDefault
  })

  const getValue = (obj, prop) => {
    try {
      return obj[prop]
    } catch (error) {
      return ''
    }
  }

  const filterUsers = (element) => {
    const fila = filaSelecionada.value
    if (fila == null) return true
    const queues_valid = element.queues.filter(queue => queue.id === fila)
    return queues_valid.length > 0
  }

  const listarFilas = async () => {
    try {
      const { data } = await ListarFilas()
      filas.value = data.filter(fila => fila.isActive)
      modalTransferirTicket.value = true
      await listarUsuarios()
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Problema ao carregar filas',
        caption: error.message
      })
    }
  }

  const listarUsuarios = async () => {
    try {
      const { data } = await ListarUsuarios()
      usuarios.value = data.users
      modalTransferirTicket.value = true
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Problema ao carregar usuários',
        caption: error.message
      })
    }
  }

  const confirmarTransferenciaTicket = async () => {
    if (!filaSelecionada.value) return

    if (ticketFocado.value.userId === usuarioSelecionado.value && ticketFocado.value.userId != null) {
      $q.notify({
        type: 'info',
        message: 'Ticket já pertence ao usuário selecionado.',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
      return
    }

    if (ticketFocado.value.userId === userId && userId === usuarioSelecionado.value) {
      $q.notify({
        type: 'info',
        message: 'Ticket já pertence ao seu usuário',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
      return
    }

    if (ticketFocado.value.queueId === filaSelecionada.value && ticketFocado.value.userId === usuarioSelecionado.value) {
      $q.notify({
        type: 'info',
        message: 'Ticket já pertence a esta fila e usuário',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
      return
    }

    try {
      await AtualizarTicket(ticketFocado.value.id, {
        userId: usuarioSelecionado.value,
        queueId: filaSelecionada.value,
        status: usuarioSelecionado.value == null ? 'pending' : 'open',
        isTransference: 1
      })

      $q.notify({
        type: 'positive',
        message: 'Ticket transferido.',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalTransferirTicket.value = false
      store.commit('TICKET_FOCADO', {})
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao transferir ticket',
        caption: error.message
      })
    }
  }

  const toggleMenu = () => {
    menuVisible.value = !menuVisible.value
  }

  const sairConversa = () => {
    store.commit('TICKET_FOCADO', {})
  }

  return {
    menuVisible,
    modalTransferirTicket,
    usuarioSelecionado,
    filaSelecionada,
    usuarios,
    filas,
    ticketFocado,
    cticket,
    getValue,
    filterUsers,
    listarFilas,
    listarUsuarios,
    confirmarTransferenciaTicket,
    toggleMenu,
    sairConversa
  }
}
