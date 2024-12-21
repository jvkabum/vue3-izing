import { ref } from 'vue'
import { api } from '../services/api'
import { useNotification } from './useNotification'

export function useAppUsers() {
  // Estado
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Composables
  const { notify } = useNotification()

  // Métodos
  const fetchUsers = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/users')
      users.value = data
      return data
    } catch (err) {
      error.value = err.message
      notify({
        type: 'negative',
        message: 'Erro ao buscar usuários',
        position: 'top'
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  const setUsers = (newUsers) => {
    users.value = newUsers
  }

  const updateUser = async (userId, userData) => {
    loading.value = true
    try {
      const { data } = await api.put(`/users/${userId}`, userData)
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex] = data
      }
      notify({
        type: 'positive',
        message: 'Usuário atualizado com sucesso',
        position: 'top'
      })
      return data
    } catch (err) {
      error.value = err.message
      notify({
        type: 'negative',
        message: 'Erro ao atualizar usuário',
        position: 'top'
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (userId) => {
    loading.value = true
    try {
      await api.delete(`/users/${userId}`)
      users.value = users.value.filter(u => u.id !== userId)
      notify({
        type: 'positive',
        message: 'Usuário removido com sucesso',
        position: 'top'
      })
    } catch (err) {
      error.value = err.message
      notify({
        type: 'negative',
        message: 'Erro ao remover usuário',
        position: 'top'
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData) => {
    loading.value = true
    try {
      const { data } = await api.post('/users', userData)
      users.value.push(data)
      notify({
        type: 'positive',
        message: 'Usuário criado com sucesso',
        position: 'top'
      })
      return data
    } catch (err) {
      error.value = err.message
      notify({
        type: 'negative',
        message: 'Erro ao criar usuário',
        position: 'top'
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    users,
    loading,
    error,

    // Métodos
    fetchUsers,
    setUsers,
    updateUser,
    deleteUser,
    createUser
  }
}
