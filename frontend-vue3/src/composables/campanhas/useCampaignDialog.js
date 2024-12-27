import { ref } from 'vue'

export function useCampaignDialog() {
  const isDialogOpen = ref(false)
  const editingCampaign = ref(null)

  function openAddDialog() {
    editingCampaign.value = {
      name: '',
      description: '',
      status: 'draft',
      scheduledDate: null,
      message: '',
      tags: [],
      contacts: []
    }
    isDialogOpen.value = true
  }

  function openEditDialog(campaign) {
    editingCampaign.value = { ...campaign }
    isDialogOpen.value = true
  }

  function closeDialog() {
    isDialogOpen.value = false
    editingCampaign.value = null
  }

  function validateCampaign(campaign) {
    const errors = []

    if (!campaign.name?.trim()) {
      errors.push('Nome é obrigatório')
    }

    if (!campaign.message?.trim()) {
      errors.push('Mensagem é obrigatória')
    }

    if (campaign.status === 'scheduled' && !campaign.scheduledDate) {
      errors.push('Data de agendamento é obrigatória para campanhas agendadas')
    }

    if (!campaign.contacts?.length) {
      errors.push('Selecione pelo menos um contato')
    }

    return errors
  }

  return {
    // State
    isDialogOpen,
    editingCampaign,

    // Methods
    openAddDialog,
    openEditDialog,
    closeDialog,
    validateCampaign
  }
}
