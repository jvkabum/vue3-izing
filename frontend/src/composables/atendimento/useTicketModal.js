import { ref, computed } from 'vue'
import whatsBackground from '../../assets/wa-background.png'
import whatsBackgroundDark from '../../assets/wa-background-dark.jpg'

export function useTicketModal() {
  const isTicketModalOpen = ref(false)
  const currentTicket = ref({})

  const cardStyle = computed(() => ({
    backgroundImage: document.body.classList.contains('body--dark') 
      ? `url(${whatsBackgroundDark})` 
      : `url(${whatsBackground})`
  }))

  const openModal = (ticket) => {
    currentTicket.value = ticket
    isTicketModalOpen.value = true
  }

  const closeModal = () => {
    isTicketModalOpen.value = false
    currentTicket.value = {}
  }

  const espiarAtendimento = async (ticket) => {
    openModal(ticket)
  }

  return {
    isTicketModalOpen,
    currentTicket,
    cardStyle,
    openModal,
    closeModal,
    espiarAtendimento
  }
}
