<template>
  <div class="acoes-table">
    <q-table
      square
      flat
      bordered
      class="my-sticky-dynamic"
      title="Ações"
      :data="acoes"
      :columns="columns"
      :loading="loading"
      row-key="id"
      hide-bottom
      :pagination="pagination"
      :rows-per-page-options="[0]"
    >
      <!-- Botão Adicionar -->
      <template #top-right>
        <q-btn
          color="primary"
          icon="add"
          label="Nova Ação"
          outline
          rounded
          @click="handleAddAcao"
        >
          <q-tooltip>Adicionar nova ação</q-tooltip>
        </q-btn>
      </template>

      <!-- Coluna Ações -->
      <template #body-cell-acoes="props">
        <q-td class="text-center">
          <div class="row justify-center q-gutter-sm">
            <!-- Ícone de Mensagem -->
            <q-icon
              size="24px"
              :name="!props.row.replyDefinition ? 'mdi-email-off-outline' : 'mdi-email-send-outline'"
              :color="props.row.replyDefinition ? 'positive' : 'negative'"
            >
              <q-tooltip class="bg-light-blue-1 text-black q-pa-sm shadow-4">
                <span class="text-weight-medium">Mensagem de retorno:</span>
                <span class="row col">
                  {{ props.row.replyDefinition || 'Sem mensagem de retorno' }}
                </span>
              </q-tooltip>
            </q-icon>

            <!-- Botões de Ação -->
            <q-btn
              flat
              round
              icon="edit"
              color="warning"
              @click="handleEditAcao(props.row)"
            >
              <q-tooltip>Editar ação</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              @click="handleDeleteAcao(props.row)"
            >
              <q-tooltip>Excluir ação</q-tooltip>
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
          <q-icon name="mdi-sitemap-outline" size="2em" class="q-mr-sm" />
          Nenhuma ação encontrada
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useFluxoAutoResposta } from '../../../composables/fluxoAutoResposta/useFluxoAutoResposta'

const $q = useQuasar()

// Props
const props = defineProps({
  acoes: {
    type: Array,
    required: true
  },
  etapa: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['acao:created', 'acao:edited', 'acao:deleted'])

// Estado
const loading = ref(false)
const pagination = ref({
  rowsPerPage: 0
})

// Composables
const { acaoEtapa } = useFluxoAutoResposta()

// Colunas
const columns = [
  { 
    name: 'words', 
    label: 'Chave', 
    field: 'words', 
    align: 'left' 
  },
  { 
    name: 'action', 
    label: 'Ação', 
    field: 'action', 
    align: 'left', 
    format: (v) => acaoEtapa.find(a => a.value == v)?.label 
  },
  { 
    name: 'queueId', 
    label: 'Fila Destino', 
    field: 'queueId', 
    align: 'center' 
  },
  { 
    name: 'userIdDestination', 
    label: 'Usuário Destino', 
    field: 'userIdDestination', 
    align: 'center' 
  },
  { 
    name: 'nextStepId', 
    label: 'ID Etapa destino', 
    field: 'nextStepId', 
    align: 'center' 
  },
  { 
    name: 'acoes', 
    label: 'Ações', 
    field: 'acoes', 
    align: 'center' 
  }
]

// Handlers
const handleAddAcao = () => {
  emit('acao:created')
}

const handleEditAcao = (acao) => {
  emit('acao:edited', acao)
}

const handleDeleteAcao = async (acao) => {
  try {
    await $q.dialog({
      title: 'Atenção!!',
      message: `Deseja realmente deletar a Ação "Chave: ${acao.words}"?`,
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

    emit('acao:deleted', acao)
  } catch (error) {
    // Usuário cancelou
  }
}
</script>

<style lang="scss" scoped>
.acoes-table {
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

  // Ícones
  .q-icon {
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .acoes-table {
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
