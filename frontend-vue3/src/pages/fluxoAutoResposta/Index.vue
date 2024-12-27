<template>
  <div class="fluxo-auto-resposta">
    <!-- Construtor de Fluxo -->
    <q-card class="q-ma-md">
      <q-card-section class="q-pa-sm">
        <ccFlow
          :filas="filas"
          :usuarios="usuarios"
        />
      </q-card-section>
    </q-card>

    <!-- Tabela de Auto Respostas -->
    <q-card v-if="false" class="q-ma-md">
      <q-card-section>
        <q-table
          square
          flat
          bordered
          class="my-sticky-dynamic"
          title="Auto Resposta"
          hide-bottom
          :data="listaAutoResposta"
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
              @click="handleAddAutoResposta"
            >
              <q-tooltip>Adicionar nova auto resposta</q-tooltip>
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
                    @click="editarAutoResposta(props.row)"
                  >
                    <q-tooltip>Editar auto resposta</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="negative"
                    @click="deletarAutoResposta(props.row)"
                  >
                    <q-tooltip>Excluir auto resposta</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>

            <!-- Conteúdo Expandido -->
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%">
                <EtapasTable 
                  :etapas="props.row.stepsReply"
                  :auto-reply="props.row"
                  @etapa:created="handleEtapaCriada"
                  @etapa:edited="handleEtapaEditada"
                  @etapa:deleted="handleEtapaDeleted"
                />
              </q-td>
            </q-tr>
          </template>

          <!-- Status -->
          <template #body-cell-isActive="props">
            <q-td class="text-center">
              <q-icon
                size="24px"
                :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
                :color="props.value ? 'positive' : 'negative'"
              >
                <q-tooltip>
                  {{ props.value ? 'Ativo' : 'Inativo' }}
                </q-tooltip>
              </q-icon>
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
              <q-icon name="mdi-robot" size="2em" class="q-mr-sm" />
              Nenhuma auto resposta encontrada
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modais -->
    <ModalAutoResposta
      v-model="modalAutoResposta"
      v-model:auto-resposta-edicao="autoRespostaSelecionado"
      @auto-resposta:criada="handleAutoRespostaCriada"
      @auto-resposta:editada="handleAutoRespostaEditada"
    />

    <ModalEtapaAutoResposta
      v-model="modalEtapaAutoResposta"
      v-model:etapa-edicao="etapaAutoRespostaEdicao"
      :auto-reply="autoReply"
      @etapa:criada="handleEtapaCriada"
      @etapa:editada="handleEtapaEditada"
    />

    <ModalAcaoEtapa
      v-model="modalAcaoEtapa"
      v-model:acao-edicao="acaoEtapaEdicao"
      :filas="filas"
      :auto-reply="autoReply"
      :etapa-auto-resposta="etapaAutoRespostaEdicao"
      :usuarios="usuarios"
      @acao:editada="handleAcaoEditada"
      @acao:criada="handleAcaoCriada"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFluxoAutoResposta } from '../../composables/fluxoAutoResposta/useFluxoAutoResposta'
import ccFlow from '../../components/ccFlowBuilder/panel.vue'
import ModalAutoResposta from './ModalAutoResposta.vue'
import ModalEtapaAutoResposta from './ModalEtapaAutoResposta.vue'
import ModalAcaoEtapa from './ModalAcaoEtapa.vue'
import EtapasTable from './components/EtapasTable.vue'

// Composables
const {
  autoRespostaSelecionado,
  modalAutoResposta,
  etapaAutoRespostaEdicao,
  modalEtapaAutoResposta,
  modalAcaoEtapa,
  acaoEtapaEdicao,
  autoReply,
  loading,
  filas,
  usuarios,
  listaAutoResposta,
  pagination,
  columns,
  listarAutoReply,
  listarFilas,
  listarUsuarios
} = useFluxoAutoResposta()

// Handlers
const handleAddAutoResposta = () => {
  autoRespostaSelecionado.value = {}
  modalAutoResposta.value = true
}

const handleAutoRespostaCriada = (autoResposta) => {
  listaAutoResposta.value = [...listaAutoResposta.value, autoResposta]
}

const handleAutoRespostaEditada = (autoResposta) => {
  const idx = listaAutoResposta.value.findIndex(a => a.id === autoResposta.id)
  if (idx > -1) {
    listaAutoResposta.value[idx] = autoResposta
  }
}

const handleEtapaCriada = (etapa) => {
  const autoResposta = listaAutoResposta.value.find(a => a.id === etapa.idAutoReply)
  if (autoResposta) {
    if (!Array.isArray(autoResposta.stepsReply)) {
      autoResposta.stepsReply = []
    }
    autoResposta.stepsReply.push(etapa)
  }
}

const handleEtapaEditada = (etapa) => {
  const autoResposta = listaAutoResposta.value.find(a => a.id === etapa.idAutoReply)
  if (autoResposta) {
    const idx = autoResposta.stepsReply.findIndex(s => s.id === etapa.id)
    if (idx > -1) {
      autoResposta.stepsReply[idx] = etapa
    }
  }
}

const handleEtapaDeleted = (etapa) => {
  const autoResposta = listaAutoResposta.value.find(a => a.id === etapa.idAutoReply)
  if (autoResposta) {
    autoResposta.stepsReply = autoResposta.stepsReply.filter(s => s.id !== etapa.id)
  }
}

const handleAcaoEditada = (acao) => {
  const autoResposta = listaAutoResposta.value.find(a => a.id === autoReply.value.id)
  if (autoResposta) {
    autoResposta.stepsReply.forEach(step => {
      if (step.id === acao.stepReplyId) {
        const idx = step.stepsReplyAction.findIndex(a => a.id === acao.id)
        if (idx > -1) {
          step.stepsReplyAction[idx] = acao
        }
      }
    })
  }
}

const handleAcaoCriada = (acao) => {
  const autoResposta = listaAutoResposta.value.find(a => a.id === autoReply.value.id)
  if (autoResposta) {
    autoResposta.stepsReply.forEach(step => {
      if (step.id === acao.stepReplyId) {
        if (!Array.isArray(step.stepsReplyAction)) {
          step.stepsReplyAction = []
        }
        step.stepsReplyAction.push(acao)
      }
    })
  }
}

// Lifecycle
onMounted(() => {
  listarFilas()
  listarUsuarios()
  listarAutoReply()
})
</script>

<style lang="scss" scoped>
.fluxo-auto-resposta {
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
  .fluxo-auto-resposta {
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
