import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { AdminListarUsuarios } from '../../service/user'

/**
 * Composable para gerenciar usuários super
 * @returns {Object} Objeto contendo estados e métodos dos usuários super
 */
export function useUsuariosSuper() {
  const $q = useQuasar()

  // Estado
  const loading = ref(false)
  const usuarios = ref([])
  const usuarioSelecionado = ref({})
  const modalUsuario = ref(false)
  const modalUsuarioEdit = ref(false)
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
    { value: 'admin', label: 'Administrador' },
    { value: 'super', label: 'Super' }
  ]

  /**
   * Configuração das colunas da tabela
   */
  const columns = [
    { 
      name: 'tenantId', 
      label: 'Empresa', 
      field: 'tenant', 
      align: 'left', 
      format: v => `${v.id} - ${v.name}` 
    },
    { 
      name: 'id', 
      label: 'ID', 
      field: 'id', 
      align: 'left' 
    },
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
      const { data } = await AdminListarUsuarios(params.value)
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
    usuarios.value.push(usuario)
    listarUsuarios()
  }

  /**
   * Prepara usuário para edição
   */
  const editarUsuario = (usuario) => {
    usuarioSelecionado.value = usuario
    modalUsuarioEdit.value = true
  }

  /**
   * Prepara novo usuário
   */
  const handleAddUsuario = () => {
    usuarioSelecionado.value = {}
    modalUsuario.value = true
  }

  return {
    // Estado
    loading,
    usuarios,
    usuarioSelecionado,
    modalUsuario,
    modalUsuarioEdit,
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
    handleAddUsuario
  }
}
