<template>
  <div v-if="userProfile === 'admin'" class="usuarios-page">
    <q-table
      class="my-sticky-dynamic q-ma-lg"
      title="Usuários"
      :data="usuarios"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination="pagination"
      :rows-per-page-options="[0]"
      @virtual-scroll="onScroll"
    >
      <!-- Cabeçalho -->
      <template #top-right>
        <div class="row q-gutter-md items-center">
          <!-- Busca -->
          <q-input
            v-model="filter"
            outlined
            rounded
            dense
            debounce="500"
            placeholder="Buscar usuário"
            clearable
            class="col-grow"
            style="min-width: 300px"
            @update:model-value="filtrarUsuario"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
            <template #append v-if="filter">
              <q-icon name="close" class="cursor-pointer" @click="filter = null; filtrarUsuario(null)" />
            </template>
          </q-input>

          <!-- Botão Adicionar -->
          <q-btn
            color="primary"
            icon="add"
            label="Adicionar"
            rounded
            @click="handleAddUsuario"
          >
            <q-tooltip>Adicionar novo usuário</q-tooltip>
          </q-btn>
        </div>
      </template>

      <!-- Coluna Filas -->
      <template #body-cell-queues="props">
        <q-td>
          <div class="queues-content">
            {{ props.value ? props.value.map(f => f.queue).join(', ') : '' }}
            <q-tooltip v-if="props.value?.length">
              {{ props.value.map(f => f.queue).join(', ') }}
            </q-tooltip>
          </div>
        </q-td>
      </template>

      <!-- Coluna Ações -->
      <template #body-cell-acoes="props">
        <q-td class="text-center">
          <div class="row justify-center q-gutter-sm">
            <!-- Gestão de Filas -->
            <q-btn
              flat
              round
              icon="mdi-arrow-decision-outline"
              color="info"
              @click="gerirFilasUsuario(props.row)"
            >
              <q-tooltip>Gestão de Filas do usuário</q-tooltip>
            </q-btn>

            <!-- Editar -->
            <q-btn
              flat
              round
              icon="edit"
              color="warning"
              @click="editarUsuario(props.row)"
            >
              <q-tooltip>Editar usuário</q-tooltip>
            </q-btn>

            <!-- Excluir -->
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              @click="deletarUsuario(props.row)"
            >
              <q-tooltip>Excluir usuário</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <!-- Paginação -->
      <template #pagination="{ pagination }">
        <div class="row items-center justify-end">
          {{ usuarios.length }}/{{ pagination.rowsNumber }}
        </div>
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
          <q-icon name="mdi-account-off" size="2em" class="q-mr-sm" />
          Nenhum usuário encontrado
        </div>
      </template>
    </q-table>

    <!-- Modais -->
    <ModalUsuario
      v-model="modalUsuario"
      v-model:usuario-edicao="usuarioSelecionado"
      @modal-usuario:usuario-editado="UPDATE_USUARIO"
      @modal-usuario:usuario-criado="usuarioCriado"
    />

    <ModalFilaUsuario
      v-model="modalFilaUsuario"
      v-model:usuario-selecionado="usuarioSelecionado"
      :filas="filas"
      @modal-fila-usuario:sucesso="UPDATE_USUARIO"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUsuarios } from '../../composables/usuarios/useUsuarios'
import ModalUsuario from './ModalUsuario.vue'
import ModalFilaUsuario from './ModalFilaUsuario.vue'

// Estado
const userProfile = ref(localStorage.getItem('profile'))

// Composables
const {
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
} = useUsuarios()

// Handlers
const handleAddUsuario = () => {
  usuarioSelecionado.value = {}
  modalUsuario.value = true
}

// Lifecycle
onMounted(() => {
  initialize()
})
</script>

<style lang="scss" scoped>
.usuarios-page {
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

  // Campo de busca
  .q-input {
    .q-field__control {
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--q-primary);
      }
    }
  }

  // Conteúdo das filas
  .queues-content {
    max-width: 400px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.8;
      cursor: help;
    }
  }

  // Botões
  .q-btn {
    opacity: 0.9;
    transition: all 0.3s ease;

    &:hover {
      opacity: 1;
      transform: scale(1.05);
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .usuarios-page {
    .my-sticky-dynamic {
      .q-table__top,
      .q-table__bottom,
      thead tr:first-child th {
        background-color: $dark;
      }
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .usuarios-page {
    .q-table {
      .q-table__top {
        flex-direction: column;
        
        .row {
          width: 100%;
          margin: 8px 0;
        }
      }
    }
  }
}
</style>
