<template>
  <div v-if="userProfile === 'admin'" class="filas-page">
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Filas"
      :data="filas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination="pagination"
      :rows-per-page-options="[0]"
    >
      <!-- Botão Adicionar -->
      <template #top-right>
        <q-btn
          color="primary"
          icon="add"
          label="Adicionar"
          rounded
          @click="handleAddFila"
        >
          <q-tooltip>Adicionar nova fila</q-tooltip>
        </q-btn>
      </template>

      <!-- Coluna Status -->
      <template #body-cell-isActive="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'positive' : 'negative'"
          >
            <q-tooltip>
              {{ props.value ? 'Ativa' : 'Inativa' }}
            </q-tooltip>
          </q-icon>
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
              @click="editarFila(props.row)"
            >
              <q-tooltip>Editar fila</q-tooltip>
            </q-btn>

            <!-- Excluir -->
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              @click="deletarFila(props.row)"
            >
              <q-tooltip>Excluir fila</q-tooltip>
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
          <q-icon name="queue" size="2em" class="q-mr-sm" />
          Nenhuma fila encontrada
        </div>
      </template>
    </q-table>

    <!-- Modal de Fila -->
    <ModalFila
      v-model="modalFila"
      v-model:fila-edicao="filaEdicao"
      @modal-fila:criada="filaCriada"
      @modal-fila:editada="filaEditada"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFilas } from '../../composables/filas/useFilas'
import ModalFila from './ModalFila.vue'

// Estado
const userProfile = ref(localStorage.getItem('profile'))

// Composables
const {
  filas,
  filaEdicao,
  modalFila,
  loading,
  pagination,
  columns,
  listarFilas,
  filaCriada,
  filaEditada,
  editarFila,
  deletarFila,
  handleAddFila
} = useFilas()

// Lifecycle
onMounted(() => {
  listarFilas()
})
</script>

<style lang="scss" scoped>
.filas-page {
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

  // Status
  .status-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 8px;
    border-radius: 16px;
    transition: all 0.3s ease;
  }
}

// Tema escuro
:deep(.body--dark) {
  .filas-page {
    .my-sticky-dynamic {
      .q-table__top,
      .q-table__bottom,
      thead tr:first-child th {
        background-color: $dark;
      }
    }
  }
}
</style>
