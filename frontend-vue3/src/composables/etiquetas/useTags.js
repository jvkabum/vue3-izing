import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { useAuth } from './useAuth'

export function useTags() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()
  const { isAdmin } = useAuth()

  // Estado
  const tags = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedTags = ref([])
  const searchTerm = ref('')

  // Cores padrão para novas tags
  const defaultColors = [
    '#4CAF50', '#2196F3', '#9C27B0', '#F44336',
    '#FF9800', '#795548', '#607D8B', '#3F51B5',
    '#009688', '#E91E63', '#FFC107', '#00BCD4'
  ]

  // Computed
  const filteredTags = computed(() => {
    if (!searchTerm.value) return tags.value

    const search = searchTerm.value.toLowerCase()
    return tags.value.filter(tag => 
      tag.name.toLowerCase().includes(search)
    )
  })

  const groupedTags = computed(() => {
    const groups = {}
    filteredTags.value.forEach(tag => {
      const category = tag.category || 'Geral'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(tag)
    })
    return groups
  })

  const tagsByColor = computed(() => {
    const grouped = {}
    tags.value.forEach(tag => {
      const color = tag.color || '#000000'
      if (!grouped[color]) {
        grouped[color] = []
      }
      grouped[color].push(tag)
    })
    return grouped
  })

  // Métodos
  const loadTags = async () => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get('/tags')
      tags.value = data

      // Restaurar seleção salva
      const savedSelection = localStorage.getItem('selectedTags')
      if (savedSelection) {
        try {
          selectedTags.value = JSON.parse(savedSelection)
        } catch (err) {
          console.error('Erro ao restaurar tags selecionadas:', err)
        }
      }

      return data
    } catch (err) {
      error.value = 'Erro ao carregar tags'
      console.error('Erro ao carregar tags:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTag = async (tagData) => {
    try {
      loading.value = true
      error.value = null

      // Atribuir cor aleatória se não fornecida
      if (!tagData.color) {
        tagData.color = defaultColors[Math.floor(Math.random() * defaultColors.length)]
      }

      const { data } = await api.post('/tags', tagData)
      tags.value.push(data)

      $q.notify({
        type: 'positive',
        message: 'Tag criada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao criar tag'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTag = async (tagId, tagData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.put(`/tags/${tagId}`, tagData)
      
      const index = tags.value.findIndex(t => t.id === tagId)
      if (index !== -1) {
        tags.value[index] = data
      }

      $q.notify({
        type: 'positive',
        message: 'Tag atualizada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar tag'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTag = async (tagId) => {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/tags/${tagId}`)
      tags.value = tags.value.filter(t => t.id !== tagId)

      // Remover da seleção se necessário
      selectedTags.value = selectedTags.value.filter(id => id !== tagId)
      saveTagSelection()

      $q.notify({
        type: 'positive',
        message: 'Tag removida com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao remover tag'
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleTagSelection = (tagId) => {
    const index = selectedTags.value.indexOf(tagId)
    if (index === -1) {
      selectedTags.value.push(tagId)
    } else {
      selectedTags.value.splice(index, 1)
    }
    saveTagSelection()
  }

  const selectAllTags = () => {
    selectedTags.value = tags.value.map(t => t.id)
    saveTagSelection()
  }

  const clearTagSelection = () => {
    selectedTags.value = []
    saveTagSelection()
  }

  const saveTagSelection = () => {
    localStorage.setItem('selectedTags', JSON.stringify(selectedTags.value))
  }

  const getRandomColor = () => {
    return defaultColors[Math.floor(Math.random() * defaultColors.length)]
  }

  const getTagById = (tagId) => {
    return tags.value.find(t => t.id === tagId)
  }

  const getTagsByIds = (tagIds) => {
    return tags.value.filter(t => tagIds.includes(t.id))
  }

  // Socket handlers
  const handleTagUpdate = (data) => {
    const index = tags.value.findIndex(t => t.id === data.id)
    if (index !== -1) {
      tags.value[index] = data
    } else {
      tags.value.push(data)
    }
  }

  const handleTagDelete = (tagId) => {
    tags.value = tags.value.filter(t => t.id !== tagId)
    selectedTags.value = selectedTags.value.filter(id => id !== tagId)
    saveTagSelection()
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('tag:update', handleTagUpdate)
    socket.value?.on('tag:delete', handleTagDelete)
  }

  const removeSocketListeners = () => {
    socket.value?.off('tag:update', handleTagUpdate)
    socket.value?.off('tag:delete', handleTagDelete)
  }

  // Lifecycle
  onMounted(() => {
    setupSocketListeners()
    loadTags()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    tags,
    loading,
    error,
    selectedTags,
    searchTerm,

    // Computed
    filteredTags,
    groupedTags,
    tagsByColor,

    // Constantes
    defaultColors,

    // Métodos
    loadTags,
    createTag,
    updateTag,
    deleteTag,
    toggleTagSelection,
    selectAllTags,
    clearTagSelection,
    getRandomColor,
    getTagById,
    getTagsByIds
  }
}
