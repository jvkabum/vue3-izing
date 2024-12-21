<template>
  <q-card class="settings-card">
    <q-card-section class="q-pb-none">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Configurações do Sistema</div>
        <q-btn
          v-if="hasChanges"
          dense
          flat
          color="primary"
          icon="restore"
          @click="confirmReset"
        >
          <q-tooltip>Restaurar alterações</q-tooltip>
        </q-btn>
      </div>
      <q-separator />
    </q-card-section>

    <q-card-section class="q-pa-md">
      <q-scroll-area style="height: 70vh">
        <q-form @submit="save" class="q-gutter-md">
          <!-- Configurações Gerais -->
          <div class="section-container">
            <div class="text-subtitle1 q-mb-sm">Configurações Gerais</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="settings.general.companyName"
                  label="Nome da Empresa"
                  :rules="[val => !!val || 'Campo obrigatório']"
                  outlined
                  dense
                  @update:model-value="handleChange"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="settings.general.companyLogo"
                  label="URL do Logo da Empresa"
                  outlined
                  dense
                  @update:model-value="handleChange"
                >
                  <template #append>
                    <q-icon
                      v-if="settings.general.companyLogo"
                      name="preview"
                      class="cursor-pointer"
                      @click="previewLogo"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="settings.general.timezone"
                  :options="timezones"
                  label="Fuso Horário"
                  :rules="[val => !!val || 'Campo obrigatório']"
                  outlined
                  dense
                  emit-value
                  map-options
                  @update:model-value="handleChange"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="settings.general.language"
                  :options="languages"
                  label="Idioma"
                  :rules="[val => !!val || 'Campo obrigatório']"
                  outlined
                  dense
                  emit-value
                  map-options
                  @update:model-value="handleChange"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="settings.general.currency"
                  :options="currencies"
                  label="Moeda"
                  outlined
                  dense
                  emit-value
                  map-options
                  @update:model-value="handleChange"
                />
              </div>
            </div>
          </div>

          <!-- Configurações de Chat -->
          <div class="section-container">
            <div class="text-subtitle1 q-mb-sm">Configurações de Chat</div>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="settings.chat.welcomeMessage"
                  label="Mensagem de Boas-Vindas"
                  type="textarea"
                  outlined
                  dense
                  @update:model-value="handleChange"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="settings.chat.farewellMessage"
                  label="Mensagem de Despedida"
                  type="textarea"
                  outlined
                  dense
                  @update:model-value="handleChange"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="settings.chat.outOfHoursMessage"
                  label="Mensagem Fora do Horário"
                  type="textarea"
                  outlined
                  dense
                  @update:model-value="handleChange"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="settings.chat.maxQueueTime"
                  label="Tempo Máximo na Fila (minutos)"
                  type="number"
                  outlined
                  dense
                  @update:model-value="handleChange"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="settings.chat.maxTicketsPerUser"
                  label="Máximo de Tickets por Usuário"
                  type="number"
                  outlined
                  dense
                  @update:model-value="handleChange"
                />
              </div>
            </div>
          </div>

          <!-- Configurações de Notificação -->
          <div class="section-container">
            <div class="text-subtitle1 q-mb-sm">Configurações de Notificação</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="settings.notifications.sound"
                  label="Som de Notificação"
                  @update:model-value="handleChange"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="settings.notifications.desktop"
                  label="Notificações Desktop"
                  @update:model-value="handleChange"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="settings.notifications.email"
                  label="Notificações por Email"
                  @update:model-value="handleChange"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-if="settings.notifications.email"
                  v-model="settings.notifications.emailFrequency"
                  :options="emailFrequencies"
                  label="Frequência de Emails"
                  outlined
                  dense
                  emit-value
                  map-options
                  @update:model-value="handleChange"
                />
              </div>
            </div>
          </div>
        </q-form>
      </q-scroll-area>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right" class="q-pa-md">
      <q-btn
        label="Cancelar"
        color="negative"
        flat
        :disable="!hasChanges"
        @click="confirmReset"
      />
      <q-btn
        label="Salvar"
        color="primary"
        :loading="loading"
        :disable="!hasChanges || !isValid"
        @click="save"
      />
    </q-card-actions>

    <!-- Logo Preview Dialog -->
    <q-dialog v-model="showLogoPreview">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Preview do Logo</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="flex flex-center">
            <q-img
              :src="settings.general.companyLogo"
              style="max-width: 300px"
            >
              <template v-slot:error>
                <div class="text-negative">
                  Erro ao carregar imagem
                </div>
              </template>
            </q-img>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Confirm Reset Dialog -->
    <q-dialog v-model="showResetConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">Deseja restaurar as alterações?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Confirmar" color="negative" @click="reset" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsForm } from '../composables/useSettingsForm'

const showLogoPreview = ref(false)
const showResetConfirm = ref(false)

const {
  settings,
  loading,
  hasChanges,
  isValid,
  timezones,
  languages,
  currencies,
  emailFrequencies,
  init,
  save,
  reset,
  handleChange
} = useSettingsForm()

const previewLogo = () => {
  showLogoPreview.value = true
}

const confirmReset = () => {
  showResetConfirm.value = true
}

onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped>
.settings-card {
  .section-container {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.q-scroll-area) {
    border-radius: 4px;
  }
}

// Dark mode support
.body--dark {
  .settings-card {
    .section-container {
      background: rgba(255, 255, 255, 0.03);
    }
  }
}

// Responsive
@media (max-width: 599px) {
  .settings-card {
    .section-container {
      padding: 12px;
      margin-bottom: 16px;
    }
  }
}
</style>
