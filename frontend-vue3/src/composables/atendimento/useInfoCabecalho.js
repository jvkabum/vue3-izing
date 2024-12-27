import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useAtendimentoStore } from '@/stores/atendimento'
import { useUserStore } from '@/stores/user'
import { useQueueStore } from '@/stores/queue'
import { TransferirTicket } from '@/service/tickets'

export function useInfoCabecalho() {
  const $q = useQuasar()
  const atendimentoStore = useAtendimentoStore()
  const userStore = useUserStore()
  const queueStore = useQueueStore()

  // Store State
  const { ticketFocado: cticket } = storeToRefs(atendimentoStore)
  const { users: usuarios } = storeToRefs(userStore)
  const { queues: filas } = storeToRefs(queueStore)

  // Local State
  const modalTransferirTicket = ref(false)
  const usuarioSelecionado = ref(null)
  const filaSelecionada = ref(null)

  // Computed
  const ticketFocado = computed(() => cticket.value)

  // Methods
  function getValue(obj, path) {
    try {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj)
    } catch (error) {
      return null
    }
  }

  function filterUsers(user) {
    if (!filaSelecionada.value) return true
    return user.profile === 'admin' || user.queues.includes(filaSelecionada.value)
  }

  async function listarFilas() {
    try {
      await queueStore.fetchQueues()
      modalTransferirTicket.value = true
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao listar filas',
        position: 'top'
      })
    }
  }

  async function confirmarTransferenciaTicket() {
    if (!filaSelecionada.value) {
      $q.notify({
        type: 'warning',
        message: 'Selecione uma fila',
        position: 'top'
      })
      return
    }

    try {
      await TransferirTicket({
        ticketId: cticket.value.id,
        queueId: filaSelecionada.value,
        userId: usuarioSelecionado.value
      })

      $q.notify({
        type: 'positive',
        message: 'Ticket transferido com sucesso',
        position: 'top'
      })

      modalTransferirTicket.value = false
      filaSelecionada.value = null
      usuarioSelecionado.value = null
      
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao transferir ticket',
        position: 'top'
      })
    }
  }

  return {
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
    confirmarTransferenciaTicket
  }
}
