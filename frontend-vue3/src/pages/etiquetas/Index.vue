<template>
  <div v-if="userProfile === 'admin'" class="etiquetas-page">
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Etiquetas"
      :data="etiquetas"
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
          @click="handleAddEtiqueta"
        >
          <q-tooltip>Adicionar nova etiqueta</q-tooltip>
        </q-btn>
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
            <!-- Editar -->
            <q-btn
              flat
              round
              icon="edit"
              color="warning"
              @click="editarEtiqueta(props.row)"
            >
              <q-tooltip>Editar etiqueta</q-tooltip>
            </q-btn>

            <!-- Excluir -->
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              @click="deletarEtiqueta(props.row)"
            >
              <q-tooltip>Excluir etiqueta</q-tooltip>
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
          <q-icon name="label" size="2em" class="q-mr-sm" />
          Nenhuma etiqueta encontrada
        </div>
      </template>
    </q-table>

    <!-- Modal de Etiqueta -->
    <ModalEtiqueta
      v-model="modalEtiqueta"
      v-model:etiqueta-edicao="etiquetaEdicao"
      @modal-etiqueta:criada="etiquetaCriada"
      @modal-etiqueta:editada="etiquetaEditada"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEtiquetas } from '../../composables/etiquetas/useEtiquetas'
import ModalEtiqueta from './ModalEtiqueta.vue'

// Estado
const userProfile = ref(localStorage.getItem('profile'))

// Composables
const {
  etiquetas,
  etiquetaEdicao,
  modalEtiqueta,
  loading,
  pagination,
  columns,
  listarEtiquetas,
  etiquetaCriada,
  etiquetaEditada,
  editarEtiqueta,
  deletarEtiqueta,
  handleAddEtiqueta
} = useEtiquetas()

// Lifecycle
onMounted(() => {
  listarEtiquetas()
})
</script>

<style lang="scss" scoped>
.etiquetas-page {
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
  .etiquetas-page {
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
}
</style>
