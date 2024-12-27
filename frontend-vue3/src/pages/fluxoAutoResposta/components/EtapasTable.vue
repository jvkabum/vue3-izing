<template>
  <div class="etapas-table">
    <q-table
      class="my-sticky-dynamic"
      title="Etapas"
      square
      flat
      bordered
      hide-bottom
      :data="etapas"
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
          label="Nova Etapa"
          outline
          rounded
          @click="handleAddEtapa"
        >
          <q-tooltip>Adicionar nova etapa</q-tooltip>
        </q-btn>
      </template>

      <!-- Expansão da Linha -->
      <template #header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!-- Conteúdo da Linha -->
      <template #body="props">
        <q-tr :props="props">
          <!-- Botão Expandir -->
          <q-td auto-width>
            <q-btn
              size="sm"
              color="accent"
              round
              dense
              :icon="props.expand ? 'remove' : 'add'"
              @click="props.expand = !props.expand"
            >
              <q-tooltip>
                {{ props.expand ? 'Recolher' : 'Expandir' }}
              </q-tooltip>
            </q-btn>
          </q-td>

          <!-- Colunas -->
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.value }}
          </q-td>

          <!-- Ações -->
          <q-td auto-width class="text-center">
            <div class="row justify-center q-gutter-sm">
              <q-btn
                flat
                round
                icon="edit"
                color="warning"
                @click="handleEditEtapa(props.row)"
              >
                <q-tooltip>Editar etapa</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                icon="delete"
                color="negative"
                @click="handleDeleteEtapa(props.row)"
              >
                <q-tooltip>Excluir etapa</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>

        <!-- Conteúdo Expandido -->
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <AcoesTable 
              :acoes="props.row.stepsReplyAction"
              :etapa="props.row"
              @acao:created="handleAcaoCriada"
              @acao:edited="handleAcaoEditada"
              @acao:deleted="handleAcaoDeleted"
            />
          </q-td>
        </q-tr>
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
          <q-icon name="mdi-sitemap" size="2em" class="q-mr-sm" />
          Nenhuma etapa encontrada
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import AcoesTable from './AcoesTable.vue'

const $q = useQuasar()

// Props
const props = defineProps({
  etapas: {
    type: Array,
    required: true
  },
  autoReply: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['etapa:created', 'etapa:edited', 'etapa:deleted'])

// Estado
const loading = ref(false)
const pagination = ref({
  rowsPerPage: 0
})

// Colunas
const columns = [
  { 
    name: 'id', 
    label: 'ID', 
    field: 'id', 
    align: 'center', 
    sortable: true, 
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) 
  },
  { 
    name: 'reply', 
    label: 'Mensagem', 
    field: 'reply', 
    align: 'left', 
    classes: 'ellipsis', 
    style: 'max-width: 400px;' 
  },
  { 
    name: 'initialStep', 
    label: 'Etapa Inicial', 
    sortable: true, 
    field: 'initialStep', 
    align: 'left', 
    format: v => v ? 'Sim' : '' 
  },
  { name: 'acoes', label: '', field: 'acoes', align: 'center' }
]

// Handlers
const handleAddEtapa = () => {
  emit('etapa:created')
}

const handleEditEtapa = (etapa) => {
  emit('etapa:edited', etapa)
}

const handleDeleteEtapa = async (etapa) => {
  try {
    await $q.dialog({
      title: 'Atenção!!',
      message: `Deseja realmente deletar a Etapa "ID: ${etapa.id}"?`,
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

    emit('etapa:deleted', etapa)
  } catch (error) {
    // Usuário cancelou
  }
}

const handleAcaoCriada = (acao) => {
  const etapa = props.etapas.find(e => e.id === acao.stepReplyId)
  if (etapa) {
    if (!Array.isArray(etapa.stepsReplyAction)) {
      etapa.stepsReplyAction = []
    }
    etapa.stepsReplyAction.push(acao)
  }
}

const handleAcaoEditada = (acao) => {
  const etapa = props.etapas.find(e => e.id === acao.stepReplyId)
  if (etapa) {
    const idx = etapa.stepsReplyAction.findIndex(a => a.id === acao.id)
    if (idx > -1) {
      etapa.stepsReplyAction[idx] = acao
    }
  }
}

const handleAcaoDeleted = (acao) => {
  const etapa = props.etapas.find(e => e.id === acao.stepReplyId)
  if (etapa) {
    etapa.stepsReplyAction = etapa.stepsReplyAction.filter(a => a.id !== acao.id)
  }
}
</script>

<style lang="scss" scoped>
.etapas-table {
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
  .etapas-table {
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
