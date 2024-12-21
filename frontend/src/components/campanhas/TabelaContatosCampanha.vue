<template>
  <q-table
    class="my-sticky-dynamic q-ma-sm"
    title="Contatos"
    id="tabela-contatos-campanha"
    :data="contatos"
    :columns="columns"
    :loading="loading"
    row-key="id"
    :pagination.sync="pagination"
    :rows-per-page-options="[0]"
    separator="cell"
  >
    <template #top>
      <div class="row col-4 q-table__title items-center">
        Contatos
      </div>
      <q-space />
      
      <!-- Botão Atualizar -->
      <q-btn
        rounded
        class="q-ml-md"
        color="black"
        icon="refresh"
        @click="$emit('refresh')"
      >
        <q-tooltip>
          Atualizar Listagem
        </q-tooltip>
      </q-btn>

      <!-- Botão Limpar Campanha -->
      <q-btn
        v-if="showClearButton"
        class="q-ml-md"
        color="negative"
        icon="close"
        outline
        rounded
        label="Limpar Campanha"
        @click="$emit('clear')"
      />

      <!-- Botão Incluir Contatos -->
      <q-btn
        v-if="showAddButton"
        class="q-ml-md"
        color="primary"
        label="Incluir Contatos"
        icon="add"
        rounded
        @click="$emit('add')"
      />
    </template>

    <!-- Coluna Avatar -->
    <template #body-cell-profilePicUrl="props">
      <q-td>
        <q-avatar style="border: 1px solid #9e9e9ea1 !important">
          <q-icon
            v-if="!props.value"
            name="mdi-account"
            size="1.5em"
            color="grey-5"
          />
          <q-img
            v-else
            :src="props.value"
            style="max-width: 150px"
          >
            <template #error>
              <q-icon
                name="mdi-account"
                size="1.5em"
                color="grey-5"
              />
            </template>
          </q-img>
        </q-avatar>
      </q-td>
    </template>

    <!-- Coluna Ações -->
    <template #body-cell-acoes="props">
      <q-td class="text-center">
        <q-btn
          v-if="showDeleteButton"
          flat
          round
          icon="mdi-delete"
          @click="$emit('delete', props.row)"
        />
      </q-td>
    </template>

    <!-- Paginação -->
    <template #pagination="{ pagination }">
      {{ contatos.length }}/{{ pagination.rowsNumber }}
    </template>
  </q-table>
</template>

<script setup>
import { computed } from 'vue'
import { estadoPorDdd, estadosBR } from '../../utils/constants'

const props = defineProps({
  contatos: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: ''
  },
  pagination: {
    type: Object,
    default: () => ({
      rowsPerPage: 40,
      rowsNumber: 0,
      lastIndex: 0
    })
  }
})

const emit = defineEmits(['refresh', 'clear', 'add', 'delete'])

// Computed
const showClearButton = computed(() => 
  props.status === 'pending' || props.status === 'canceled'
)

const showAddButton = computed(() => 
  props.status === 'pending' || props.status === 'canceled'
)

const showDeleteButton = computed(() => 
  props.status === 'pending'
)

// Colunas da tabela
const columns = [
  { 
    name: 'profilePicUrl', 
    label: '', 
    field: 'profilePicUrl', 
    style: 'width: 50px', 
    align: 'center' 
  },
  { 
    name: 'name', 
    label: 'Nome', 
    field: 'name', 
    align: 'left', 
    style: 'width: 300px' 
  },
  { 
    name: 'number', 
    label: 'WhatsApp', 
    field: 'number', 
    align: 'center', 
    style: 'width: 300px' 
  },
  {
    name: 'campaignContacts',
    label: 'Status',
    field: 'campaignContacts',
    align: 'center',
    style: 'width: 200px',
    format: (v) => {
      const ACK = {
        '-1': 'Error',
        0: 'Envio Pendente',
        1: 'Entrega Pendente',
        2: 'Recebida',
        3: 'Lida',
        4: 'Reproduzido'
      }
      return v ? ACK[v[0].ack] : ''
    }
  },
  {
    name: 'tags',
    label: 'Etiquetas',
    field: 'tags',
    style: 'width: 500px',
    align: 'left',
    format: (v) => {
      if (v) {
        const strs = v.map(i => i.tag)
        return strs.join(', ')
      }
      return ''
    }
  },
  { 
    name: 'estado', 
    label: 'Estado', 
    field: 'number', 
    style: 'width: 500px', 
    align: 'left', 
    format: (v) => {
      const ddd = v.substring(2, 4)
      return estadosBR.find(e => e.sigla === estadoPorDdd[ddd])?.nome || ''
    }
  },
  { 
    name: 'acoes', 
    label: 'Ações', 
    field: 'acoes', 
    align: 'center' 
  }
]
</script>

<style lang="scss" scoped>
.my-sticky-dynamic {
  height: 75vh;

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

#tabela-contatos-atendimento {
  thead th {
    height: 55px;
  }
}
</style>
