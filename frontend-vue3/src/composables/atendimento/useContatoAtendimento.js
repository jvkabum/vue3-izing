import { computed } from 'vue'
import { useQuasar } from 'quasar'

export function useContatoAtendimento(props) {
  const $q = useQuasar()

  const contact = computed(() => props.ticket?.contact || null)

  const contactName = computed(() => {
    return contact.value?.name || 'Sem nome'
  })

  const profilePicture = computed(() => {
    return contact.value?.profilePicUrl || getDefaultProfilePic()
  })

  const contactInitials = computed(() => {
    if (!contact.value?.name) return '?'

    return contact.value.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  })

  function getDefaultProfilePic() {
    return 'https://cdn.quasar.dev/img/avatar.png'
  }

  function copyContactInfo(info, label) {
    navigator.clipboard.writeText(info).then(() => {
      $q.notify({
        type: 'positive',
        message: `${label} copiado para a área de transferência`,
        position: 'top'
      })
    }).catch(() => {
      $q.notify({
        type: 'negative',
        message: `Erro ao copiar ${label.toLowerCase()}`,
        position: 'top'
      })
    })
  }

  function getChannelIcon() {
    switch (props.ticket?.channel?.toLowerCase()) {
      case 'whatsapp':
        return 'mdi-whatsapp'
      case 'instagram':
        return 'mdi-instagram'
      case 'facebook':
        return 'mdi-facebook'
      case 'telegram':
        return 'mdi-telegram'
      default:
        return 'mdi-chat'
    }
  }

  function getChannelColor() {
    switch (props.ticket?.channel?.toLowerCase()) {
      case 'whatsapp':
        return 'green'
      case 'instagram':
        return 'purple'
      case 'facebook':
        return 'blue'
      case 'telegram':
        return 'light-blue'
      default:
        return 'grey'
    }
  }

  function getChannelLabel() {
    switch (props.ticket?.channel?.toLowerCase()) {
      case 'whatsapp':
        return 'WhatsApp'
      case 'instagram':
        return 'Instagram'
      case 'facebook':
        return 'Facebook'
      case 'telegram':
        return 'Telegram'
      default:
        return 'Chat'
    }
  }

  function formatPhoneNumber(phone) {
    if (!phone) return ''

    // Remove todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, '')

    // Formato: (XX) XXXXX-XXXX
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }

    // Formato: (XX) XXXX-XXXX
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }

    return phone
  }

  return {
    contact,
    contactName,
    profilePicture,
    contactInitials,
    copyContactInfo,
    getChannelIcon,
    getChannelColor,
    getChannelLabel,
    formatPhoneNumber
  }
}
