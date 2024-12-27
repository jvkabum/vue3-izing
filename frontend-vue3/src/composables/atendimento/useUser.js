import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { ListarUsuarios, CriarUsuario, AtualizarUsuario, DeletarUsuario } from 'src/service/user'

export function useUser() {
  const $q = useQuasar()
  const store = useStore()
  const loading = ref(false)

  const usuarios = ref([])
  const usuarioSelecionado = ref(null)
  const modalUsuario = ref(false)

  const usuariosAtivos = computed(() => {
    return usuarios.value.filter(user => user.isActive)
  })

  const carregarUsuarios = async () => {
    loading.value = true
    try {
      const { data } = await ListarUsuarios()
      usuarios.value = data.users
      store.commit('SET_USERS', data.users)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar usuários',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const criarUsuario = async (usuario) => {
    loading.value = true
    try {
      const { data } = await CriarUsuario(usuario)
      
      usuarios.value.push(data)
      store.commit('ADD_USER', data)

      $q.notify({
        type: 'positive',
        message: 'Usuário criado com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalUsuario.value = false
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar usuário',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const atualizarUsuario = async (usuario) => {
    loading.value = true
    try {
      const { data } = await AtualizarUsuario(usuario.id, usuario)
      
      const index = usuarios.value.findIndex(u => u.id === usuario.id)
      if (index !== -1) {
        usuarios.value[index] = data
      }

      store.commit('UPDATE_USER', data)

      $q.notify({
        type: 'positive',
        message: 'Usuário atualizado com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })

      modalUsuario.value = false
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar usuário',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const deletarUsuario = async (usuarioId) => {
    try {
      await $q.dialog({
        title: 'Confirmar exclusão',
        message: 'Tem certeza que deseja excluir este usuário?',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      })

      loading.value = true
      await DeletarUsuario(usuarioId)
      
      usuarios.value = usuarios.value.filter(u => u.id !== usuarioId)
      store.commit('DELETE_USER', usuarioId)

      $q.notify({
        type: 'positive',
        message: 'Usuário excluído com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      if (error === false) return // Dialog cancelled
      
      console.error('Erro ao deletar usuário:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar usuário',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const abrirModalUsuario = (usuario = null) => {
    usuarioSelecionado.value = usuario
    modalUsuario.value = true
  }

  const fecharModalUsuario = () => {
    usuarioSelecionado.value = null
    modalUsuario.value = false
  }

  const salvarUsuario = async (usuario) => {
    if (usuario.id) {
      await atualizarUsuario(usuario)
    } else {
      await criarUsuario(usuario)
    }
  }

  const atribuirFilas = async (usuario, filas) => {
    loading.value = true
    try {
      const { data } = await AtualizarUsuario(usuario.id, {
        ...usuario,
        queues: filas
      })

      const index = usuarios.value.findIndex(u => u.id === usuario.id)
      if (index !== -1) {
        usuarios.value[index] = data
      }

      store.commit('UPDATE_USER', data)

      $q.notify({
        type: 'positive',
        message: 'Filas atribuídas com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      console.error('Erro ao atribuir filas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atribuir filas',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    usuarios,
    usuariosAtivos,
    usuarioSelecionado,
    modalUsuario,
    carregarUsuarios,
    criarUsuario,
    atualizarUsuario,
    deletarUsuario,
    abrirModalUsuario,
    fecharModalUsuario,
    salvarUsuario,
    atribuirFilas
  }
}
