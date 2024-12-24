<template>
  <div v-if="userProfile === 'admin'" class="configuracoes-page">
    <q-list class="text-weight-medium">
      <!-- Cabeçalho -->
      <q-item-label header class="text-bold text-h6 q-mb-lg">
        Configurações
      </q-item-label>

      <!-- Seção: Atendimento -->
      <q-item-label caption class="q-mt-lg q-pl-sm">
        Módulo: Atendimento
      </q-item-label>
      <q-separator spaced />

      <!-- Tickets Atribuídos -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Não visualizar Tickets já atribuídos à outros usuários</q-item-label>
          <q-item-label caption>
            Somente o usuário responsável pelo ticket e/ou os administradores visualizarão o atendimento.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="NotViewAssignedTickets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewAssignedTickets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @update:model-value="value => atualizarConfiguracao('NotViewAssignedTickets', value)"
          />
        </q-item-section>
      </q-item>

      <!-- Tickets no ChatBot -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Não visualizar Tickets no ChatBot</q-item-label>
          <q-item-label caption>
            Somente administradores poderão visualizar tickets que estiverem interagindo com o ChatBot.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="NotViewTicketsChatBot"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewTicketsChatBot === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @update:model-value="value => atualizarConfiguracao('NotViewTicketsChatBot', value)"
          />
        </q-item-section>
      </q-item>

      <!-- Atendimento via Carteira -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Forçar atendimento via Carteira</q-item-label>
          <q-item-label caption>
            Caso o contato tenha carteira vinculada, o sistema irá direcionar o atendimento somente para os donos da carteira de clientes.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="DirectTicketsToWallets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="DirectTicketsToWallets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @update:model-value="value => atualizarConfiguracao('DirectTicketsToWallets', value)"
          />
        </q-item-section>
      </q-item>

      <!-- Fluxo do Bot -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Fluxo ativo para o Bot de atendimento</q-item-label>
          <q-item-label caption>
            Fluxo a ser utilizado pelo Bot para os novos atendimentos
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-select
            class="bot-flow-select"
            outlined
            dense
            rounded
            v-model="botTicketActive"
            :options="listaChatFlow"
            map-options
            emit-value
            option-value="id"
            option-label="name"
            @update:model-value="value => atualizarConfiguracao('botTicketActive', value)"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Nenhum fluxo disponível
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-item-section>
      </q-item>

      <!-- Mensagens de Grupo -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Ignorar Mensagens de Grupo</q-item-label>
          <q-item-label caption>
            Habilitando esta opção o sistema não abrirá ticket para grupos
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="ignoreGroupMsg"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="ignoreGroupMsg === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @update:model-value="value => atualizarConfiguracao('ignoreGroupMsg', value)"
          />
        </q-item-section>
      </q-item>

      <!-- Chamadas WhatsApp -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Recusar chamadas no WhatsApp</q-item-label>
          <q-item-label caption>
            Quando ativo, as ligações de áudio e vídeo serão recusadas automaticamente.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="rejectCalls"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="rejectCalls === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @update:model-value="value => atualizarConfiguracao('rejectCalls', value)"
          />
        </q-item-section>
      </q-item>

      <!-- Mensagem de Rejeição -->
      <div 
        class="row q-px-md" 
        v-if="rejectCalls === 'enabled'"
      >
        <div class="col-12">
          <q-input
            rounded
            v-model="callRejectMessage"
            type="textarea"
            autogrow
            dense
            outlined
            label="Mensagem ao rejeitar ligação:"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @update:model-value="value => atualizarConfiguracao('callRejectMessage', value)"
          />
        </div>
      </div>

      <!-- Fechamento Automático -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Fechamento Automático de Tickets</q-item-label>
          <q-item-label caption>
            Defina o número de dias após os quais os tickets pendentes serão fechados automaticamente.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-input
            v-model="daysToClose"
            type="number"
            min="1"
            outlined
            dense
            label="Dias para fechar tickets"
            @update:model-value="value => atualizarConfiguracao('daysToClose', value)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfiguracoes } from '../../composables/configuracoes/useConfiguracoes'

// Estado
const userProfile = ref(localStorage.getItem('profile'))

// Composables
const {
  configuracoes,
  listaChatFlow,
  NotViewAssignedTickets,
  NotViewTicketsChatBot,
  DirectTicketsToWallets,
  botTicketActive,
  ignoreGroupMsg,
  rejectCalls,
  callRejectMessage,
  daysToClose,
  listarConfiguracoes,
  listarChatFlow,
  atualizarConfiguracao
} = useConfiguracoes()

// Lifecycle
onMounted(() => {
  listarConfiguracoes()
  listarChatFlow()
})
</script>

<style lang="scss" scoped>
.configuracoes-page {
  // Estilos gerais
  .q-item {
    border-radius: 8px;
    transition: background-color 0.3s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.03);
    }
  }

  // Select do fluxo do bot
  .bot-flow-select {
    width: 300px;
    
    :deep(.q-field__control) {
      padding: 0 8px;
    }
  }

  // Toggles
  :deep(.q-toggle) {
    .q-toggle__inner {
      min-width: 45px;
      transition: all 0.3s ease;

      &:before {
        border-radius: 12px;
      }

      .q-toggle__thumb {
        border-radius: 50%;
      }
    }

    &--checked {
      .q-toggle__inner {
        .q-toggle__thumb {
          background: white;
        }
      }
    }
  }

  // Inputs
  :deep(.q-input) {
    .q-field__control {
      transition: border-color 0.3s ease;

      &:hover {
        border-color: var(--q-primary);
      }
    }

    &--focused {
      .q-field__control {
        border-color: var(--q-primary);
      }
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .configuracoes-page {
    .q-item:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .q-input {
      .q-field__control {
        &:hover {
          border-color: var(--q-primary);
        }
      }
    }
  }
}
</style>
