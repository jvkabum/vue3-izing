<template>
  <div class="super-users">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Super Usuários</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="person_add"
          label="Novo Super Usuário"
          @click="openUserDialog()"
        />
        <q-btn-dropdown color="secondary" label="Ações">
          <q-list>
            <q-item clickable v-close-popup @click="exportUsers">
              <q-item-section avatar>
                <q-icon name="download" />
              </q-item-section>
              <q-item-section>Exportar Lista</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="openAuditLog">
              <q-item-section avatar>
                <q-icon name="history" />
              </q-item-section>
              <q-item-section>Log de Auditoria</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Filtros -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchTerm"
          dense
          outlined
          placeholder="Buscar usuários..."
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
            v-model="selectedRole"
            :options="roleOptions"
            label="Função"
            outlined
            dense
            clearable
            emit-value
            map-options
          />
        </div>
        <div class="col">
          <q-select
            v-model="selectedStatus"
            :options="statusOptions"
            label="Status"
            outlined
            dense
            clearable
            emit-value
            map-options
          />
        </div>
      </div>
    </div>

    <!-- Lista de Usuários -->
    <q-table
      :rows="filteredUsers"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination.sync="pagination"
      flat
      bordered
    >
      <!-- Slots personalizados -->
      <template v-slot:body-cell-avatar="props">
        <q-td :props="props">
          <q-avatar size="32px">
            <img :src="props.row.avatar || 'default-avatar.png'" />
          </q-avatar>
        </q-td>
      </template>

      <template v-slot:body-cell-role="props">
        <q-td :props="props">
          <q-chip
            :color="getRoleColor(props.value)"
            text-color="white"
            dense
          >
            {{ getRoleLabel(props.value) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="getStatusColor(props.value)"
            text-color="white"
            dense
          >
            {{ props.value }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row items-center justify-end q-gutter-sm">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="openUserDialog(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              :color="props.row.active ? 'negative' : 'positive'"
              :icon="props.row.active ? 'block' : 'check_circle'"
              @click="toggleUserStatus(props.row)"
            >
              <q-tooltip>{{ props.row.active ? 'Desativar' : 'Ativar' }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="history"
              @click="openUserHistory(props.row)"
            >
              <q-tooltip>Histórico</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Dialogs -->
    <super-user-dialog
      v-model="showUserDialog"
      :user="selectedUser"
      @save="saveUser"
    />

    <!-- Dialog de Histórico -->
    <q-dialog v-model="showHistoryDialog" maximized>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">Histórico do Usuário</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <user-history :user-id="selectedUser?.id" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog de Log de Auditoria -->
    <q-dialog v-model="showAuditDialog" maximized>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">Log de Auditoria</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <audit-log />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUsers } from '../../composables/usuarios/useUsers'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import SuperUserDialog from './SuperUserDialog.vue'
import UserHistory from './UserHistory.vue'
import AuditLog from './AuditLog.vue'

// Composables
const {
  users,
  loading,
  error,
  saveUser: saveUserData,
  toggleStatus,
  exportUsers: exportUsersData
} = useUsers()
const { notifySuccess, notifyError } = useNotificationSystem()

// Estado
const searchTerm = ref('')
const selectedRole = ref(null)
const selectedStatus = ref(null)
const showUserDialog = ref(false)
const showHistoryDialog = ref(false)
const showAuditDialog = ref(false)
const selectedUser = ref(null)
const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

// Opções
const roleOptions = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Supervisor', value: 'supervisor' },
  { label: 'Gerente', value: 'manager' }
]

const statusOptions = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Bloqueado', value: 'blocked' }
]

// Configuração da tabela
const columns = [
  {
    name: 'avatar',
    label: '',
    field: 'avatar',
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
    name: 'email',
    label: 'Email',
    field: 'email',
    sortable: true
  },
  {
    name: 'role',
    label: 'Função',
    field: 'role',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true
  },
  {
    name: 'lastAccess',
    label: 'Último Acesso',
    field: 'lastAccess',
    sortable: true,
    format: val => val ? new Date(val).toLocaleString() : 'Nunca'
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'right'
  }
]

// Computed
const filteredUsers = computed(() => {
  let filtered = [...users.value]

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }

  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(user => user.status === selectedStatus.value)
  }

  return filtered
})

// Métodos
const openUserDialog = (user = null) => {
  selectedUser.value = user
  showUserDialog.value = true
}

const openUserHistory = (user) => {
  selectedUser.value = user
  showHistoryDialog.value = true
}

const openAuditLog = () => {
  showAuditDialog.value = true
}

const saveUser = async (userData) => {
  try {
    await saveUserData(userData)
    showUserDialog.value = false
    notifySuccess('Usuário salvo com sucesso')
  } catch (err) {
    notifyError('Erro ao salvar usuário')
  }
}

const toggleUserStatus = async (user) => {
  try {
    await toggleStatus(user.id)
    notifySuccess(`Usuário ${user.active ? 'desativado' : 'ativado'} com sucesso`)
  } catch (err) {
    notifyError('Erro ao alterar status do usuário')
  }
}

const exportUsers = async () => {
  try {
    await exportUsersData()
    notifySuccess('Lista de usuários exportada com sucesso')
  } catch (err) {
    notifyError('Erro ao exportar lista de usuários')
  }
}

const getRoleColor = (role) => {
  const colors = {
    admin: 'purple',
    supervisor: 'deep-purple',
    manager: 'indigo'
  }
  return colors[role] || 'grey'
}

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    manager: 'Gerente'
  }
  return labels[role] || role
}

const getStatusColor = (status) => {
  const colors = {
    active: 'positive',
    inactive: 'grey',
    blocked: 'negative'
  }
  return colors[status] || 'grey'
}
</script>

<style lang="scss" scoped>
.super-users {
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
