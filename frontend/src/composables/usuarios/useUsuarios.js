import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { ListarUsuarios, DeleteUsuario } from '../../service/user'
import { ListarFilas } from '../../service/filas'

/**
 * Composable para gerenciar usuários
 * @returns {Object} Objeto contendo estados e métodos dos usuários
 */
export function useUsuarios() {
  const $q = useQuasar()

  // Estado
  const loading = ref(false)
  const usuarios = ref([])
  const usuarioSelecionado = ref({})
  const modalFilaUsuario = ref(false)
  const filas = ref([])
  const modalUsuario = ref(false)
  const filter = ref(null)

  // Paginação
  const pagination = ref({
    rowsPerPage: 40,
    rowsNumber: 0,
    lastIndex: 0
  })

  // Parâmetros de busca
  const params = ref({
    pageNumber: 1,
    searchParam: null,
    hasMore: true
  })

  /**
   * Opções de perfil
   */
  const optionsProfile = [
    { value: 'user', label: 'Usuário' },
    { value: 'admin', label: 'Administrador' }
  ]

  /**
   * Configuração das colunas da tabela
   */
  const columns = [
    { 
      name: 'name', 
      label: 'Nome', 
      field: 'name', 
      align: 'left' 
    },
    { 
      name: 'email', 
      label: 'E-mail', 
      field: 'email', 
      align: 'left' 
    },
    {
      name: 'queues',
      label: 'Filas',
      field: 'queues',
      align: 'left',
      format: (v) => !v ? '' : v.map(f => f.queue).join(', '),
      classes: 'ellipsis',
      style: 'max-width: 400px;'
    },
    { 
      name: 'profile', 
      label: 'Perfil', 
      field: 'profile', 
      align: 'left', 
      format: (v) => optionsProfile.find(o => o.value === v)?.label 
    },
    { 
      name: 'acoes', 
      label: 'Ações', 
      field: 'acoes', 
      align: 'center' 
    }
  ]

  /**
   * Carrega usuários
   */
  const LOAD_USUARIOS = (users) => {
    const newUsers = []
    users.forEach(user => {
      const userIndex = usuarios.value.findIndex(c => c.id === user.id)
      if (userIndex !== -1) {
        usuarios.value[userIndex] = user
      } else {
        newUsers.push(user)
      }
    })
    const usersObj = [...usuarios.value, ...newUsers]
    usuarios.value = usersObj.filter(usuario => usuario.profile !== 'super')
  }

  /**
   * Atualiza usuário
   */
  const UPDATE_USUARIO = (usuario) => {
    let newUsuarios = [...usuarios.value]
    const usuarioIndex = newUsuarios.findIndex(c => c.id === usuario.id)
    if (usuarioIndex !== -1) {
      newUsuarios[usuarioIndex] = usuario
    } else {
      newUsuarios = [usuario, ...newUsuarios]
    }
    usuarios.value = [...newUsuarios]
  }

  /**
   * Remove usuário
   */
  const DELETE_USUARIO = (userId) => {
    usuarios.value = usuarios.value.filter(u => u.id !== userId)
  }

  /**
   * Lista usuários
   */
  const listarUsuarios = async () => {
    try {
      loading.value = true
      const { data } = await ListarUsuarios(params.value)
      usuarios.value = data.users
      LOAD_USUARIOS(data.users)
      params.value.hasMore = data.hasMore
      pagination.value.lastIndex = usuarios.value.length - 1
      pagination.value.rowsNumber = data.count
    } catch (error) {
      console.error('Erro ao listar usuários:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar usuários',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Filtra usuários
   */
  const filtrarUsuario = (data) => {
    usuarios.value = []
    params.value.pageNumber = 1
    params.value.searchParam = data
    listarUsuarios()
  }

  /**
   * Handler de scroll infinito
   */
  const onScroll = ({ to }) => {
    if (!loading.value && params.value.hasMore && to === pagination.value.lastIndex) {
      params.value.pageNumber++
      listarUsuarios()
    }
  }

  /**
   * Adiciona novo usuário
   */
  const usuarioCriado = (usuario) => {
    usuarios.value = [...usuarios.value, usuario]
  }

  /**
   * Prepara usuário para edição
   */
  const editarUsuario = (usuario) => {
    usuarioSelecionado.value = usuario
    modalUsuario.value = true
  }

  /**
   * Deleta usuário
   */
  const deletarUsuario = async (usuario) => {
    try {
      await $q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar o usuário "${usuario.name}"?`,
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
      await DeleteUsuario(usuario.id)
      
      DELETE_USUARIO(usuario.id)
      
      $q.notify({
        type: 'positive',
        message: `Usuário ${usuario.name} deletado!`,
        position: 'top',
        timeout: 2000
      })
    } catch (error) {
      if (error) { // Ignora erro de cancelamento do diálogo
        console.error('Erro ao deletar usuário:', error)
        $q.notify({
          type: 'negative',
          message: 'Não é possível deletar o usuário',
          position: 'top'
        })
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Lista filas
   */
  const listarFilas = async () => {
    try {
      const { data } = await ListarFilas()
      filas.value = data
    } catch (error) {
      console.error('Erro ao listar filas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar filas',
        position: 'top'
      })
    }
  }

  /**
   * Prepara gestão de filas do usuário
   */
  const gerirFilasUsuario = (usuario) => {
    usuarioSelecionado.value = usuario
    modalFilaUsuario.value = true
  }

  /**
   * Inicializa dados
   */
  const initialize = async () => {
    await listarFilas()
    await listarUsuarios()
  }

  return {
    // Estado
    loading,
    usuarios,
    usuarioSelecionado,
    modalFilaUsuario,
    filas,
    modalUsuario,
    filter,
    pagination,
    params,
    optionsProfile,
    columns,

    // Métodos
    LOAD_USUARIOS,
    UPDATE_USUARIO,
    DELETE_USUARIO,
    listarUsuarios,
    filtrarUsuario,
    onScroll,
    usuarioCriado,
    editarUsuario,
    deletarUsuario,
    listarFilas,
    gerirFilasUsuario,
    initialize
  }
}
