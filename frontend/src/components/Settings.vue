<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Configurações do Sistema</div>
      <q-separator />
      <div class="q-gutter-md">
        <q-input
          v-model="settings.general.companyName"
          label="Nome da Empresa"
          outlined
          dense
        />
        <q-input
          v-model="settings.general.companyLogo"
          label="URL do Logo da Empresa"
          outlined
          dense
        />
        <q-select
          v-model="settings.general.timezone"
          :options="timezones"
          label="Fuso Horário"
          outlined
          dense
        />
        <q-select
          v-model="settings.general.language"
          :options="languages"
          label="Idioma"
          outlined
          dense
        />
        <q-select
          v-model="settings.general.currency"
          :options="currencies"
          label="Moeda"
          outlined
          dense
        />
      </div>
    </q-card-section>

    <q-card-section>
      <div class="text-h6">Configurações de Chat</div>
      <q-separator />
      <div class="q-gutter-md">
        <q-input
          v-model="settings.chat.welcomeMessage"
          label="Mensagem de Boas-Vindas"
          outlined
          dense
        />
        <q-input
          v-model="settings.chat.farewellMessage"
          label="Mensagem de Despedida"
          outlined
          dense
        />
        <q-input
          v-model="settings.chat.outOfHoursMessage"
          label="Mensagem Fora do Horário"
          outlined
          dense
        />
        <q-input
          v-model.number="settings.chat.maxQueueTime"
          label="Tempo Máximo na Fila (minutos)"
          type="number"
          outlined
          dense
        />
        <q-input
          v-model.number="settings.chat.maxTicketsPerUser"
          label="Máximo de Tickets por Usuário"
          type="number"
          outlined
          dense
        />
      </div>
    </q-card-section>

    <q-card-actions>
      <q-btn
        label="Salvar"
        color="primary"
        @click="saveSettings"
      />
      <q-btn
        label="Cancelar"
        color="negative"
        @click="cancel"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useSettings } from '../composables/useSettings'

const { loadSettings, updateSettings } = useSettings()

// Estado
const settings = ref({
  general: {
    companyName: '',
    companyLogo: '',
    timezone: '',
    language: '',
    currency: ''
  },
  chat: {
    welcomeMessage: '',
    farewellMessage: '',
    outOfHoursMessage: '',
    maxQueueTime: 30,
    maxTicketsPerUser: 5
  }
})

// Métodos
const saveSettings = async () => {
  try {
    await updateSettings(settings.value)
    await loadSettings()
  } catch (err) {
    console.error('Erro ao salvar configurações:', err)
  }
}

const cancel = () => {
  loadSettings()
}

// Carregar configurações ao montar
loadSettings()
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 16px;

  .q-card {
    margin-bottom: 16px;
  }
}
</style>
