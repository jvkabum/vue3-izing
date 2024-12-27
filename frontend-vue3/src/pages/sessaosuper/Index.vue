<template>
  <div v-if="userProfile === 'super'" class="sessao-super">
    <!-- Cabeçalho -->
    <div class="row col full-width q-pa-lg">
      <q-card flat bordered class="full-width">
        <q-card-section class="text-h6 text-bold">
          Canais
        </q-card-section>
      </q-card>
    </div>

    <!-- Grid de Canais -->
    <div class="row full-width q-py-lg q-px-md justify-start items-stretch">
      <template v-for="item in whatsapps" :key="item.id">
        <q-card flat bordered class="canal-card col-xs-12 col-sm-5 col-md-4 col-lg-3 q-ma-md">
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
              <q-item-label class="text-bold text-primary text-body1">
                Cliente: {{ `${item.tenant?.id} - ${item.tenant?.name}` }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <!-- Status do Canal -->
          <q-card-section>
            <ItemStatusChannel :item="item" />
          </q-card-section>

          <q-separator />

          <!-- Ações do Canal -->
          <q-card-actions v-if="item.status === 'DISCONNECTED'" class="q-pa-md q-pt-none" align="center">
            <q-btn-group outline>
              <!-- Adicione botões de ação conforme necessário -->
            </q-btn-group>
          </q-card-actions>
        </q-card>
      </template>
    </div>

    <!-- Loading -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSessaoSuper } from '../../composables/sessaosuper/useSessaoSuper'
import ItemStatusChannel from './ItemStatusChannel.vue'

// Estado
const userProfile = ref(localStorage.getItem('profile'))

// Composables
const {
  loading,
  empresas,
  isAdmin,
  whatsappSelecionado,
  whatsAppId,
  objStatus,
  columns,
  whatsapps,
  formatarData,
  listarChannels,
  listarEmpresas,
  initialize
} = useSessaoSuper()

// Lifecycle
onMounted(() => {
  initialize()
})

onUnmounted(() => {
  // Limpar listeners se necessário
})
</script>

<style lang="scss" scoped>
.sessao-super {
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

      &.text-primary {
        opacity: 0.9;
        transition: opacity 0.3s ease;

        &:hover {
          opacity: 1;
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
  .sessao-super {
    .canal-card {
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .sessao-super {
    .canal-card {
      margin: 8px !important;
    }
  }
}
</style>
