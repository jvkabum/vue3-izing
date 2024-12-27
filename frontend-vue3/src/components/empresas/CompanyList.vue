<template>
  <div class="company-list">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Empresas</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="add_business"
          label="Nova Empresa"
          @click="openCompanyDialog()"
        />
      </div>
    </div>

    <!-- Filtros -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchTerm"
          dense
          outlined
          placeholder="Buscar empresas..."
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-8 row q-col-gutter-sm">
        <div class="col">
          <q-select
            v-model="selectedStatus"
            :options="statusOptions"
            outlined
            dense
            label="Status"
            clearable
            emit-value
            map-options
          />
        </div>
        <div class="col">
          <q-select
            v-model="selectedPlan"
            :options="planOptions"
            outlined
            dense
            label="Plano"
            clearable
            emit-value
            map-options
          />
        </div>
      </div>
    </div>

    <!-- Lista de Empresas -->
    <q-table
      :rows="filteredCompanies"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination.sync="pagination"
      flat
      bordered
    >
      <!-- Slots personalizados -->
      <template v-slot:body-cell-logo="props">
        <q-td :props="props">
          <q-avatar size="40px">
            <img :src="props.row.logo || 'default-company-logo.png'" />
          </q-avatar>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="getStatusColor(props.row.status)"
            text-color="white"
            size="sm"
          >
            {{ getStatusLabel(props.row.status) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-plan="props">
        <q-td :props="props">
          <q-chip
            :color="getPlanColor(props.row.plan)"
            text-color="white"
            size="sm"
          >
            {{ getPlanLabel(props.row.plan) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row items-center justify-end q-gutter-sm">
            <q-btn
              flat
              round
              color="primary"
              icon="visibility"
              size="sm"
              @click="viewCompanyDetails(props.row)"
            >
              <q-tooltip>Ver detalhes</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              size="sm"
              @click="openCompanyDialog(props.row)"
            >
              <q-tooltip>Editar empresa</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Excluir empresa</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog de Empresa -->
    <company-dialog
      v-model="showCompanyDialog"
      :company="selectedCompany"
      @save="saveCompany"
    />

    <!-- Dialog de Confirmação -->
    <q-dialog v-model="showConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">Deseja realmente excluir esta empresa?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Excluir" color="negative" @click="deleteCompany" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCompany } from '../../composables/empresa/useCompany'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import CompanyDialog from './CompanyDialog.vue'

// Composables
const router = useRouter()
const { 
  companies,
  loading,
  error,
  createCompany,
  updateCompany,
  deleteCompany: removeCompany,
  loadCompanies
} = useCompany()
const { notifySuccess, notifyError } = useNotificationSystem()

// Estado
const searchTerm = ref('')
const selectedStatus = ref(null)
const selectedPlan = ref(null)
const showCompanyDialog = ref(false)
const showConfirmDialog = ref(false)
const selectedCompany = ref(null)
const companyToDelete = ref(null)

// Configuração da tabela
const columns = [
  {
    name: 'logo',
    label: '',
    field: 'logo',
    align: 'left',
    sortable: false
  },
  {
    name: 'name',
    required: true,
    label: 'Nome',
    align: 'left',
    field: row => row.name,
    sortable: true
  },
  {
    name: 'document',
    label: 'CNPJ',
    field: 'document',
    sortable: true
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true
  },
  {
    name: 'plan',
    label: 'Plano',
    field: 'plan',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'right',
    sortable: false
  }
]

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

// Opções
const statusOptions = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Bloqueado', value: 'blocked' },
  { label: 'Pendente', value: 'pending' }
]

const planOptions = [
  { label: 'Básico', value: 'basic' },
  { label: 'Profissional', value: 'professional' },
  { label: 'Empresarial', value: 'enterprise' }
]

// Computed
const filteredCompanies = computed(() => {
  let filtered = [...companies.value]

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(company => 
      company.name.toLowerCase().includes(search) ||
      company.document.includes(search) ||
      company.email.toLowerCase().includes(search)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(company => company.status === selectedStatus.value)
  }

  if (selectedPlan.value) {
    filtered = filtered.filter(company => company.plan === selectedPlan.value)
  }

  return filtered
})

// Métodos
const openCompanyDialog = (company = null) => {
  selectedCompany.value = company
  showCompanyDialog.value = true
}

const saveCompany = async (companyData) => {
  try {
    if (companyData.id) {
      await updateCompany(companyData)
      notifySuccess('Empresa atualizada com sucesso')
    } else {
      await createCompany(companyData)
      notifySuccess('Empresa criada com sucesso')
    }
    showCompanyDialog.value = false
    loadCompanies()
  } catch (err) {
    notifyError('Erro ao salvar empresa')
  }
}

const confirmDelete = (company) => {
  companyToDelete.value = company
  showConfirmDialog.value = true
}

const deleteCompany = async () => {
  try {
    await removeCompany(companyToDelete.value.id)
    notifySuccess('Empresa excluída com sucesso')
    loadCompanies()
  } catch (err) {
    notifyError('Erro ao excluir empresa')
  }
}

const viewCompanyDetails = (company) => {
  router.push(`/empresas/${company.id}`)
}

const getStatusColor = (status) => {
  const colors = {
    active: 'positive',
    inactive: 'grey',
    blocked: 'negative',
    pending: 'warning'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Ativo',
    inactive: 'Inativo',
    blocked: 'Bloqueado',
    pending: 'Pendente'
  }
  return labels[status] || status
}

const getPlanColor = (plan) => {
  const colors = {
    basic: 'blue',
    professional: 'purple',
    enterprise: 'deep-purple'
  }
  return colors[plan] || 'grey'
}

const getPlanLabel = (plan) => {
  const labels = {
    basic: 'Básico',
    professional: 'Profissional',
    enterprise: 'Empresarial'
  }
  return labels[plan] || plan
}

// Lifecycle
onMounted(async () => {
  try {
    await loadCompanies()
  } catch (err) {
    notifyError('Erro ao carregar empresas')
  }
})
</script>

<style lang="scss" scoped>
.company-list {
  padding: 20px;

  .q-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }
}

.dark {
  .q-table {
    background: $dark;
  }
}
</style>
