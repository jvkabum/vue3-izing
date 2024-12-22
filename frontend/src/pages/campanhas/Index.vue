<template>
  <div v-if="userProfile === 'admin'" class="campanhas-page">
    <q-table
      flat
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Campanhas"
      :data="campanhas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination="pagination"
      :rows-per-page-options="[0]"
    >
      <!-- Ações do Topo -->
      <template #top-right>
        <div class="row q-gutter-sm">
          <q-btn
            color="black"
            icon="refresh"
            rounded
            @click="listarCampanhas"
          >
            <q-tooltip>Atualizar Listagem</q-tooltip>
          </q-btn>
          
          <q-btn
            rounded
            color="primary"
            icon="add"
            label="Nova Campanha"
            @click="handleAddCampanha"
          />
        </div>
      </template>

      <!-- Coluna Cor -->
      <template #body-cell-color="props">
        <q-td class="text-center">
          <div
            class="color-preview rounded-borders q-pa-sm"
            :style="`background: ${props.row.color}`"
          >
            {{ props.row.color }}
          </div>
        </q-td>
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
            <!-- Botão Contatos -->
            <q-btn
              flat
              round
              icon="mdi-account-details-outline"
              color="primary"
              @click="contatosCampanha(props.row)"
            >
              <q-tooltip>Lista de Contatos da Campanha</q-tooltip>
            </q-btn>

            <!-- Botão Programar -->
            <q-btn
              v-if="['pending', 'canceled'].includes(props.row.status)"
              flat
              round
              icon="mdi-calendar-clock"
              color="info"
              @click="iniciarCampanha(props.row)"
            >
              <q-tooltip>Programar Envio</q-tooltip>
            </q-btn>

            <!-- Botão Cancelar -->
            <q-btn
              v-if="['scheduled', 'processing'].includes(props.row.status)"
              flat
              round
              icon="mdi-close-box-multiple"
              color="negative"
              @click="cancelarCampanha(props.row)"
            >
              <q-tooltip>Cancelar Campanha</q-tooltip>
            </q-btn>

            <!-- Botão Editar -->
            <q-btn
              flat
              round
              icon="edit"
              color="warning"
              @click="editarCampanha(props.row)"
            >
              <q-tooltip>Editar Campanha</q-tooltip>
            </q-btn>

            <!-- Botão Excluir -->
            <q-btn
              flat
              round
              icon="mdi-delete"
              color="negative"
              @click="deletarCampanha(props.row)"
            >
              <q-tooltip>Excluir Campanha</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <!-- Template para Loading -->
      <template #loading>
        <q-inner-loading showing color="primary">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>
      </template>

      <!-- Template para Sem Dados -->
      <template #no-data>
        <div class="full-width row flex-center q-pa-md text-grey-8">
          <q-icon name="mdi-alert-circle-outline" size="24px" class="q-mr-sm" />
          Nenhuma campanha encontrada
        </div>
      </template>
    </q-table>

    <!-- Modal de Campanha -->
    <ModalCampanha
      v-if="modalCampanha"
      v-model="modalCampanha"
      v-model:campanha-edicao="campanhaEdicao"
      @modal-campanha:criada="handleCampanhaCriada"
      @modal-campanha:editada="handleCampanhaEditada"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCampanhas } from '../../composables/campanhas/useCampanhas'
import ModalCampanha from './ModalCampanha.vue'

// Estado
const userProfile = ref(localStorage.getItem('profile'))

// Composables
const {
  loading,
  campanhas,
  campanhaEdicao,
  modalCampanha,
  columns,
  pagination,
  listarCampanhas,
  editarCampanha,
  deletarCampanha,
  contatosCampanha,
  cancelarCampanha,
  iniciarCampanha
} = useCampanhas()

// Métodos
const handleAddCampanha = () => {
  campanhaEdicao.value = {}
  modalCampanha.value = true
}

const handleCampanhaCriada = () => {
  listarCampanhas()
}

const handleCampanhaEditada = () => {
  listarCampanhas()
}

// Lifecycle
onMounted(() => {
  listarCampanhas()
})
</script>

<style lang="scss" scoped>
.campanhas-page {
  .my-sticky-dynamic {
    // Cabeçalho fixo
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
      background-color: #fff;
    }

    thead tr th {
      position: sticky;
      z-index: 1;
    }

    thead tr:last-child th {
      top: 63px;
    }

    thead tr:first-child th {
      top: 0;
    }
  }

  // Preview de cor
  .color-preview {
    min-width: 100px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  // Botões de ação
  .q-btn {
    opacity: 0.8;
    transition: all 0.3s ease;

    &:hover {
      opacity: 1;
      transform: scale(1.1);
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .my-sticky-dynamic {
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
      background-color: $dark;
    }
  }

  .color-preview {
    border-color: rgba(255, 255, 255, 0.12);
  }
}
</style>
