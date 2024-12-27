import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

export function useExtraInformation(props) {
  const $q = useQuasar()
  const loading = ref(false)
  const notes = ref('')
  const tags = ref([])
  const customFields = ref({})

  const hasNotes = computed(() => {
    return notes.value.trim().length > 0
  })

  const hasTags = computed(() => {
    return tags.value.length > 0
  })

  const hasCustomFields = computed(() => {
    return Object.keys(customFields.value).length > 0
  })

  function addTag(tag) {
    if (!tags.value.includes(tag)) {
      tags.value.push(tag)
    }
  }

  function removeTag(tag) {
    const index = tags.value.indexOf(tag)
    if (index !== -1) {
      tags.value.splice(index, 1)
    }
  }

  function updateNotes(newNotes) {
    notes.value = newNotes
  }

  function setCustomField(key, value) {
    customFields.value[key] = value
  }

  function removeCustomField(key) {
    delete customFields.value[key]
  }

  async function saveChanges() {
    loading.value = true
    try {
      // Implementar chamada à API para salvar as alterações
      // await api.post(`/tickets/${props.ticket.id}/extra-info`, {
      //   notes: notes.value,
      //   tags: tags.value,
      //   customFields: customFields.value
      // })

      $q.notify({
        type: 'positive',
        message: 'Informações salvas com sucesso'
      })
    } catch (error) {
      console.error('Erro ao salvar informações:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao salvar informações',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  function getTagColor(tag) {
    // Define cores diferentes para diferentes tipos de tags
    const colors = {
      urgente: 'negative',
      importante: 'warning',
      normal: 'positive',
      baixa: 'grey'
    }

    return colors[tag.toLowerCase()] || 'primary'
  }

  function formatCustomFieldValue(value) {
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não'
    }

    if (value instanceof Date) {
      return value.toLocaleDateString()
    }

    if (Array.isArray(value)) {
      return value.join(', ')
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value)
    }

    return value?.toString() || ''
  }

  function reset() {
    notes.value = ''
    tags.value = []
    customFields.value = {}
  }

  return {
    // State
    loading,
    notes,
    tags,
    customFields,

    // Computed
    hasNotes,
    hasTags,
    hasCustomFields,

    // Methods
    addTag,
    removeTag,
    updateNotes,
    setCustomField,
    removeCustomField,
    saveChanges,
    getTagColor,
    formatCustomFieldValue,
    reset
  }
}
