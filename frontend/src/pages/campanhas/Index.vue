<template>
  <div v-if="userProfile === 'admin'">
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
        <q-btn
          class="q-mr-md"
          color="black"
          icon="refresh"
          rounded
          @click="listarCampanhas"
        >
          <q-tooltip>
            Atualizar Listagem
          </q-tooltip>
        </q-btn>
        <q-btn
          rounded
          color="primary"
          label="Adicionar"
          @click="handleAddCampanha"
        />
      </template>

      <!-- Coluna Cor -->
      <template #body-cell-color="props">
        <q-td class="text-center">
          <div
            class="q-pa-sm rounded-borders"
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
          />
        </q-td>
      </template>

      <!-- Coluna Ações -->
      <template #body-cell-acoes="props">
        <q-td class="text-center">
          <!-- Botão Contatos -->
          <q-btn
            flat
            round
            icon="mdi-account-details-outline"
            @click="contatosCampanha(props.row)"
          >
            <q-tooltip>
              Lista de Contatos da Campanha
            </q-tooltip>
          </q-btn>

          <!-- Botão Programar -->
          <q-btn
            v-if="['pending', 'canceled'].includes(props.row.status)"
            flat
            round
            icon="mdi-calendar-clock"
            @click="iniciarCampanha(props.row)"
          >
            <q-tooltip>
              Programar Envio
            </q-tooltip>
          </q-btn>

          <!-- Botão Cancelar -->
          <q-btn
            v-if="['scheduled', 'processing'].includes(props.row.status)"
            flat
            round
            icon="mdi-close-box-multiple"
            @click="cancelarCampanha(props.row)"
          >
            <q-tooltip>
              Cancelar Campanha
            </q-tooltip>
          </q-btn>

          <!-- Botão Editar -->
          <q-btn
            flat
            round
            icon="edit"
            @click="editarCampanha(props.row)"
          >
            <q-tooltip>
              Editar Campanha
            </q-tooltip>
          </q-btn>

          <!-- Botão Excluir -->
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarCampanha(props.row)"
          >
            <q-tooltip>
              Excluir Campanha
            </q-tooltip>
          </q-btn>
        </q-td>
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
import { useCampanhas } from '../../composables/useCampanhas'
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
.my-sticky-dynamic {
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
</style>
