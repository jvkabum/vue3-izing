<template>
  <q-card class="system-version">
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="text-h6">Versão do Sistema</div>
        <q-btn
          v-if="showRefreshButton"
          flat
          round
          icon="refresh"
          :loading="loading"
          @click="checkForUpdates"
        >
          <q-tooltip>Verificar atualizações</q-tooltip>
        </q-btn>
      </div>
      
      <q-separator class="q-my-md" />

      <div v-if="error" class="text-negative q-mb-md">
        {{ error }}
      </div>

      <div class="version-info q-gutter-y-sm">
        <!-- Status do Sistema -->
        <q-banner
          v-if="updateAvailable"
          class="bg-warning text-white q-mb-md"
          rounded
        >
          <template v-slot:avatar>
            <q-icon name="system_update" />
          </template>
          Nova versão disponível!
          <template v-slot:action>
            <q-btn
              flat
              color="white"
              label="Detalhes"
              @click="showChangelogDialog = true"
            />
          </template>
        </q-banner>

        <!-- Informações da Versão -->
        <div class="row items-center q-gutter-x-sm">
          <q-icon name="numbers" size="sm" />
          <span class="text-weight-medium">Versão:</span>
          {{ version }}
        </div>

        <div class="row items-center q-gutter-x-sm">
          <q-icon name="event" size="sm" />
          <span class="text-weight-medium">Data de Lançamento:</span>
          {{ releaseDate }}
        </div>

        <div class="row items-center q-gutter-x-sm">
          <q-icon name="update" size="sm" />
          <span class="text-weight-medium">Última Atualização:</span>
          {{ lastUpdate }}
        </div>

        <!-- Status do Sistema -->
        <div class="row items-center q-gutter-x-sm">
          <q-icon :name="versionStatus.icon" :color="versionStatus.color" size="sm" />
          <span :class="`text-${versionStatus.color}`">
            {{ versionStatus.label }}
          </span>
        </div>
      </div>
    </q-card-section>

    <!-- Changelog Dialog -->
    <q-dialog v-model="showChangelogDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Novidades da Atualização</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-timeline color="secondary">
            <q-timeline-entry
              v-for="(change, index) in changelog"
              :key="index"
              :title="change.version"
              :subtitle="formatDate(change.date)"
            >
              <div v-if="change.description" class="q-mt-sm">
                {{ change.description }}
              </div>
              <ul v-if="change.changes" class="q-mt-sm">
                <li v-for="(item, i) in change.changes" :key="i">
                  {{ item }}
                </li>
              </ul>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSystemVersion } from '../composables/useSystemVersion'

const props = defineProps({
  showRefreshButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update-available', 'update-checked'])

const showChangelogDialog = ref(false)

const {
  version,
  releaseDate,
  lastUpdate,
  loading,
  error,
  updateAvailable,
  changelog,
  checkForUpdates: checkUpdates,
  getVersionStatus,
  formatDate
} = useSystemVersion()

// Computed
const versionStatus = computed(() => getVersionStatus())

// Methods
const checkForUpdates = async () => {
  const result = await checkUpdates()
  emit('update-checked', result)
  
  if (result?.updateAvailable) {
    emit('update-available', result)
  }
}

// Expose methods
defineExpose({
  checkForUpdates,
  showChangelog: () => { showChangelogDialog.value = true }
})
</script>

<style lang="scss" scoped>
.system-version {
  .version-info {
    .row {
      min-height: 32px;
    }
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }
}

// Animations
.version-info {
  .row {
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.03);
      border-radius: 4px;
    }
  }
}

// Responsive
@media (max-width: 599px) {
  .system-version {
    .text-h6 {
      font-size: 1.1rem;
    }
    
    .version-info {
      font-size: 0.9rem;
    }
  }
}
</style>
