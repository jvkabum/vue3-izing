import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { DeletarTenant, ListarTenants } from '../../service/empresas'

/**
 * Composable para gerenciar empresas
 * @returns {Object} Objeto contendo estados e métodos das empresas
 */
export function useEmpresas() {
  const $q = useQuasar()

  // Estado
  const tenants = ref([])
  const tenantEdicao = ref({})
  const modalTenant = ref(false)
  const loading = ref(false)
  const pagination = ref({
    rowsPerPage: 40,
    rowsNumber: 0,
    lastIndex: 0
  })

  /**
   * Configuração das colunas da tabela
   */
  const columns = [
    { 
      name: 'id', 
      label: '#', 
      field: 'id', 
      align: 'left' 
    },
    { 
      name: 'status', 
      label: 'Status', 
      field: 'status', 
      align: 'left', 
      format: val => formatStatus(val) 
    },
    { 
      name: 'name', 
      label: 'Nome', 
      field: 'name', 
      align: 'center' 
    },
    { 
      name: 'maxUsers', 
      label: 'Limite de Usuário', 
      field: 'maxUsers', 
      align: 'center' 
    },
    { 
      name: 'maxConnections', 
      label: 'Limite de Conexão', 
      field: 'maxConnections', 
      align: 'center' 
    },
    { 
      name: 'acoes', 
      label: 'Ações', 
      field: 'acoes', 
      align: 'center' 
    }
  ]

  /**
   * Lista todas as empresas
   */
  const listarTenants = async () => {
    try {
      const { data } = await ListarTenants()
      tenants.value = data.filter(tenant => tenant.id !== 1)
    } catch (error) {
      console.error('Erro ao listar empresas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar empresas',
        position: 'top'
      })
    }
  }

  /**
   * Adiciona uma nova empresa
   */
  const tenantCriada = (tenant) => {
    tenants.value = [...tenants.value, tenant]
  }

  /**
   * Atualiza uma empresa existente
   */
  const tenantEditada = (tenant) => {
    const idx = tenants.value.findIndex(f => f.id === tenant.id)
    if (idx > -1) {
      tenants.value[idx] = tenant
    }
  }

  /**
   * Prepara empresa para edição
   */
  const editarTenant = (tenant) => {
    tenantEdicao.value = { ...tenant }
    modalTenant.value = true
  }

  /**
   * Deleta uma empresa
   */
  const deletarTenant = async (tenant) => {
    try {
      await $q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a Empresa "${tenant.id}"?`,
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
      await DeletarTenant(tenant)
      
      tenants.value = tenants.value.filter(f => f.id !== tenant.id)
      
      $q.notify({
        type: 'positive',
        message: `Empresa ${tenant.id} deletada!`,
        position: 'top',
        timeout: 2000
      })
    } catch (error) {
      if (error) { // Ignora erro de cancelamento do diálogo
        console.error('Erro ao deletar empresa:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao deletar empresa',
          position: 'top'
        })
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Formata o status da empresa
   */
  const formatStatus = (value) => {
    return value === 'active' ? 'Ativo' : 'Inativo'
  }

  /**
   * Retorna a classe CSS baseada no status
   */
  const getStatusClass = (row) => {
    return row.status === 'active' ? 'bg-active' : 'bg-inactive'
  }

  return {
    // Estado
    tenants,
    tenantEdicao,
    modalTenant,
    loading,
    pagination,
    columns,

    // Métodos
    listarTenants,
    tenantCriada,
    tenantEditada,
    editarTenant,
    deletarTenant,
    formatStatus,
    getStatusClass
  }
}
