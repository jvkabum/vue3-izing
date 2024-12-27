import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAtendimentoStore } from 'src/stores/atendimento'
import { useUserStore } from 'src/stores/user'
import { useQueueStore } from 'src/stores/queue'
import { TransferirTicket } from 'src/service/tickets'
import { useAtendimentoNotification } from './useAtendimentoNotification'

export function useInfoCabecalho() {
  const atendimentoStore = useAtendimentoStore()
  const userStore = useUserStore()
  const queueStore = useQueueStore()
  const notification = useAtendimentoNotification()

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
  const getValue = (obj, path) => {
    try {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj)
    } catch {
      return null
    }
  }

  const filterUsers = user => {
    if (!filaSelecionada.value) return true
    return user.profile === 'admin' || user.queues.includes(filaSelecionada.value)
  }

  const listarFilas = async () => {
    try {
      await queueStore.fetchQueues()
      modalTransferirTicket.value = true
    } catch {
      notification.notifyQueueListError()
    }
  }

  const confirmarTransferenciaTicket = async () => {
    if (!filaSelecionada.value) {
      notification.notifyQueueRequired()
      return
    }

    try {
      await TransferirTicket({
        ticketId: cticket.value.id,
        queueId: filaSelecionada.value,
        userId: usuarioSelecionado.value
      })

      notification.notifyTransferSuccess()
      modalTransferirTicket.value = false
      filaSelecionada.value = null
      usuarioSelecionado.value = null
      
    } catch {
      notification.notifyTransferError()
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
