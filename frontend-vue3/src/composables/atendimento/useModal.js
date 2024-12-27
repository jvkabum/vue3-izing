import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

export const useModal = () => {
  const $q = useQuasar()
  const isSchedulingModalOpen = ref(false)
  const isForwardModalOpen = ref(false)
  const modalAgendamentoMensagem = ref(false)

  const modalStyle = computed(() => 
    $q.screen.width < 770 
      ? 'min-width: 98vw; max-width: 98vw' 
      : 'min-width: 50vw; max-width: 50vw'
  )

  function openSchedulingModal() {
    isSchedulingModalOpen.value = true
  }

  function closeSchedulingModal() {
    isSchedulingModalOpen.value = false
  }

  function toggleAgendamentoModal() {
    modalAgendamentoMensagem.value = !modalAgendamentoMensagem.value
  }

  return {
    isSchedulingModalOpen,
    isForwardModalOpen,
    modalAgendamentoMensagem,
    modalStyle,
    openSchedulingModal,
    closeSchedulingModal,
    toggleAgendamentoModal
  }
}
