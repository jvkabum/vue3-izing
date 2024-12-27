<template>
  <div v-if="userProfile === 'super'" class="empresas-page">
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Empresas"
      :data="tenants"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination="pagination"
      :rows-per-page-options="[0]"
    >
      <!-- Botão Adicionar -->
      <template #top-right>
        <q-btn
          rounded
          color="primary"
          icon="add"
          label="Adicionar"
          @click="handleAddTenant"
        >
          <q-tooltip>Adicionar nova empresa</q-tooltip>
        </q-btn>
      </template>

      <!-- Coluna Status -->
      <template #body-cell-status="props">
        <q-td :class="getStatusClass(props.row)">
          <div class="status-cell">
            <q-icon
              :name="props.row.status === 'active' ? 'check_circle' : 'cancel'"
              :color="props.row.status === 'active' ? 'positive' : 'negative'"
              size="1.5em"
            />
            <span class="q-ml-sm">{{ formatStatus(props.row.status) }}</span>
          </div>
        </q-td>
      </template>

      <!-- Coluna Ações -->
      <template #body-cell-acoes="props">
        <q-td class="text-center">
          <div class="row justify-center q-gutter-sm">
            <!-- Editar -->
            <q-btn
              flat
              round
              icon="edit"
              color="warning"
              @click="editarTenant(props.row)"
            >
              <q-tooltip>Editar empresa</q-tooltip>
            </q-btn>

            <!-- Excluir -->
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              @click="deletarTenant(props.row)"
            >
              <q-tooltip>Excluir empresa</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <!-- Loading -->
      <template #loading>
        <q-inner-loading showing color="primary">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>
      </template>

      <!-- Sem Dados -->
      <template #no-data>
        <div class="full-width row flex-center q-pa-md text-grey-8">
          <q-icon name="business" size="2em" class="q-mr-sm" />
          Nenhuma empresa encontrada
        </div>
      </template>
    </q-table>

    <!-- Modal de Empresa -->
    <ModalTenant
      v-model="modalTenant"
      v-model:tenant-edicao="tenantEdicao"
      @modal-tenant:criada="tenantCriada"
      @modal-tenant:editada="tenantEditada"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEmpresas } from '../../composables/empresas/useEmpresas'
import ModalTenant from './ModalTenant.vue'

// Estado
const userProfile = ref(localStorage.getItem('profile'))

// Composables
const {
  tenants,
  tenantEdicao,
  modalTenant,
  loading,
  pagination,
  columns,
  listarTenants,
  tenantCriada,
  tenantEditada,
  editarTenant,
  deletarTenant,
  formatStatus,
  getStatusClass
} = useEmpresas()

/**
 * Manipula adição de nova empresa
 */
const handleAddTenant = () => {
  tenantEdicao.value = {}
  modalTenant.value = true
}

// Lifecycle
onMounted(() => {
  listarTenants()
})
</script>

<style lang="scss" scoped>
.empresas-page {
  // Status
  .status-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 8px;
    border-radius: 16px;
    transition: all 0.3s ease;
  }

  // Classes de status
  .bg-active {
    background-color: rgba(33, 186, 69, 0.1);
    color: var(--q-positive);
  }

  .bg-inactive {
    background-color: rgba(193, 0, 21, 0.1);
    color: var(--q-negative);
  }

  // Tabela
  .my-sticky-dynamic {
    // Cabeçalho fixo
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
      background-color: #fff;
      transition: background-color 0.3s ease;
    }

    thead tr th {
      position: sticky;
      z-index: 1;
    }

    thead tr:last-child th {
      top: 48px;
    }

    thead tr:first-child th {
      top: 0;
    }
  }

  // Botões
  .q-btn {
    opacity: 0.8;
    transition: all 0.3s ease;

    &:hover {
      opacity: 1;
      transform: scale(1.05);
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .empresas-page {
    .my-sticky-dynamic {
      .q-table__top,
      .q-table__bottom,
      thead tr:first-child th {
        background-color: $dark;
      }
    }

    .bg-active {
      background-color: rgba(33, 186, 69, 0.2);
    }

    .bg-inactive {
      background-color: rgba(193, 0, 21, 0.2);
    }
  }
}
</style>
