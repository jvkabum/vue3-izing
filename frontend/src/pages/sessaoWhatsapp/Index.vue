<template>
  <div v-if="userProfile === 'admin'" class="sessao-whatsapp">
    <!-- Cabeçalho -->
    <div class="row col full-width q-pa-sm">
      <q-card flat class="full-width">
        <q-card-section class="text-h6 text-bold row items-center justify-between">
          <div>Canais</div>
          <q-btn
            rounded
            color="black"
            icon="add"
            label="Adicionar"
            @click="modalWhatsapp = true"
          >
            <q-tooltip>Adicionar novo canal</q-tooltip>
          </q-btn>
        </q-card-section>
      </q-card>
    </div>

    <!-- Grid de Canais -->
    <div class="row full-width justify-start items-stretch">
      <template v-for="item in canais" :key="item.id">
        <q-card flat bordered class="canal-card col-xs-12 col-sm-5 col-md-4 col-lg-3 q-ma-sm">
          <!-- Cabeçalho do Canal -->
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <q-img :src="`${item.type}-logo.png`" :alt="item.type">
                  <template #error>
                    <q-icon name="mdi-help-circle" size="40px" color="grey" />
                  </template>
                </q-img>
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-h6 text-bold">
                {{ item.name }}
              </q-item-label>
              <q-item-label caption>
                {{ item.type }}
              </q-item-label>
            </q-item-section>

            <q-item-section side v-if="isAdmin">
              <q-btn
                round
                flat
                dense
                icon="edit"
                @click="handleOpenModalWhatsapp(item)"
              >
                <q-tooltip>Editar canal</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>

          <q-separator />

          <!-- Status do Canal -->
          <q-card-section>
            <ItemStatusChannel :item="item" />
            
            <template v-if="item.type === 'messenger'">
              <div class="text-body2 text-bold q-mt-sm">
                <span>Página:</span>
                {{ item.fbObject?.name || 'Nenhuma página configurada.' }}
              </div>
            </template>
          </q-card-section>

          <!-- Seleção de Bot -->
          <q-card-section>
            <q-select
              outlined
              dense
              rounded
              label="Bot"
              v-model="item.chatFlowId"
              :options="listaChatFlow"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              clearable
              @update:model-value="handleSaveWhatsApp(item)"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Nenhum bot encontrado
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>

          <q-separator />

          <!-- Ações do Canal -->
          <q-card-actions class="q-gutter-md q-pa-md q-pt-none" align="center">
            <template v-if="item.type !== 'messenger'">
              <!-- QR Code -->
              <q-btn
                v-if="item.type === 'whatsapp' && item.status === 'qrcode'"
                rounded
                color="blue-5"
                label="QR Code"
                icon-right="qr_code"
                :disable="!isAdmin"
                @click="handleOpenQrModal(item)"
              >
                <q-tooltip>Visualizar QR Code</q-tooltip>
              </q-btn>

              <!-- Desconectado -->
              <div v-if="item.status === 'DISCONNECTED'" class="q-gutter-sm">
                <q-btn
                  rounded
                  color="positive"
                  icon="link"
                  label="Conectar"
                  @click="handleStartWhatsAppSession(item.id)"
                >
                  <q-tooltip>Iniciar conexão</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="item.type === 'whatsapp'"
                  rounded
                  color="blue-5"
                  icon="refresh"
                  label="Novo QR Code"
                  :disable="!isAdmin"
                  @click="handleRequestNewQrCode(item)"
                >
                  <q-tooltip>Gerar novo QR Code</q-tooltip>
                </q-btn>
              </div>

              <!-- Conectando -->
              <div
                v-if="item.status === 'OPENING'"
                class="row items-center q-gutter-sm"
              >
                <div class="text-bold">Conectando</div>
                <q-spinner-radio color="positive" size="2em" />
              </div>

              <!-- Conectado -->
              <q-btn
                v-if="['OPENING', 'CONNECTED', 'PAIRING', 'TIMEOUT'].includes(item.status)"
                color="negative"
                icon="link_off"
                label="Desconectar"
                :disable="!isAdmin"
                @click="handleDisconectWhatsSession(item.id)"
              >
                <q-tooltip>Encerrar conexão</q-tooltip>
              </q-btn>
            </template>

            <!-- Excluir -->
            <q-btn
              color="red"
              icon="delete"
              dense
              round
              flat
              class="absolute-bottom-right"
              :disable="!isAdmin"
              @click="deleteWhatsapp(item)"
            >
              <q-tooltip>Excluir canal</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </template>
    </div>

    <!-- Modais -->
    <ModalQrCode
      v-model="abrirModalQR"
      :channel="dadosWhatsappSelecionado"
      @gerar-novo-qrcode="handleRequestNewQrCode"
    />

    <ModalWhatsapp
      v-model="modalWhatsapp"
      v-model:whatsapp-edit="whatsappSelecionado"
      @recarregar-lista="listarWhatsapps"
    />

    <!-- Loading -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useSessaoWhatsapp } from '../../composables/sessaoWhatsapp/useSessaoWhatsapp'
import ModalQrCode from './ModalQrCode.vue'
import ModalWhatsapp from './ModalWhatsapp.vue'
import ItemStatusChannel from './ItemStatusChannel.vue'

// Estado
const userProfile = ref(localStorage.getItem('profile'))

// Composables
const {
  loading,
  isAdmin,
  abrirModalQR,
  modalWhatsapp,
  whatsappSelecionado,
  listaChatFlow,
  whatsAppId,
  canais,
  columns,
  whatsapps,
  dadosWhatsappSelecionado,
  formatarData,
  listarWhatsapps,
  listarChatFlow,
  handleOpenQrModal,
  handleOpenModalWhatsapp,
  handleDisconectWhatsSession,
  handleStartWhatsAppSession,
  handleRequestNewQrCode,
  deleteWhatsapp,
  handleSaveWhatsApp,
  initialize
} = useSessaoWhatsapp()

// Watch
watch(whatsapps, () => {
  canais.value = JSON.parse(JSON.stringify(whatsapps.value))
}, { deep: true })

// Lifecycle
onMounted(() => {
  initialize()
})

onUnmounted(() => {
  // Cleanup se necessário
})
</script>

<style lang="scss" scoped>
.sessao-whatsapp {
  // Cards
  .canal-card {
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    // Garante que as seções ocupem todo o espaço
    .q-card__section {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    // Avatar
    .q-avatar {
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    // Labels
    .q-item-label {
      &.text-h6 {
        line-height: 1.2;
      }
    }

    // Select
    .q-select {
      .q-field__control {
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--q-primary);
        }
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
}

// Tema escuro
:deep(.body--dark) {
  .sessao-whatsapp {
    .canal-card {
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .sessao-whatsapp {
    .canal-card {
      margin: 8px !important;
    }
  }
}
</style>
