<template>
  <div class="mensagens-rapidas">
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Mensagens Rápidas"
      :data="mensagensRapidas"
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
          @click="handleAddMensagem"
        >
          <q-tooltip>Adicionar nova mensagem rápida</q-tooltip>
        </q-btn>
      </template>

      <!-- Coluna Mensagem -->
      <template #body-cell-message="props">
        <q-td>
          <div class="message-content">
            {{ props.value }}
            <q-tooltip>{{ props.value }}</q-tooltip>
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
              @click="editarMensagem(props.row)"
            >
              <q-tooltip>Editar mensagem</q-tooltip>
            </q-btn>

            <!-- Excluir -->
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              @click="deletarMensagem(props.row)"
            >
              <q-tooltip>Excluir mensagem</q-tooltip>
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
          <q-icon name="mdi-message-text-outline" size="2em" class="q-mr-sm" />
          Nenhuma mensagem rápida encontrada
        </div>
      </template>
    </q-table>

    <!-- Modal de Mensagem -->
    <ModalMensagemRapida
      v-model="modalMensagemRapida"
      v-model:mensagem-rapida-edicao="mensagemRapidaEmEdicao"
      @mensagem-rapida:criada="mensagemCriada"
      @mensagem-rapida:editada="mensagemEditada"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMensagensRapidas } from '../../composables/mensagensRapidas/useMensagensRapidas'
import ModalMensagemRapida from './ModalMensagemRapida.vue'

// Composables
const {
  loading,
  mensagensRapidas,
  modalMensagemRapida,
  mensagemRapidaEmEdicao,
  pagination,
  columns,
  listarMensagensRapidas,
  mensagemCriada,
  mensagemEditada,
  editarMensagem,
  deletarMensagem,
  handleAddMensagem
} = useMensagensRapidas()

// Lifecycle
onMounted(() => {
  listarMensagensRapidas()
})
</script>

<style lang="scss" scoped>
.mensagens-rapidas {
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

  // Conteúdo da mensagem
  .message-content {
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
  .mensagens-rapidas {
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
