<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Gerenciar Campanhas</div>
      <q-separator />
      <q-input
        v-model="searchTerm"
        label="Buscar Campanha"
        outlined
        dense
        class="q-mb-md"
      />
      <q-btn
        label="Adicionar Campanha"
        color="primary"
        @click="openAddCampaignDialog"
      />
      <q-list>
        <q-item
          v-for="campaign in filteredCampaigns"
          :key="campaign.id"
          @click="openEditCampaignDialog(campaign.id)"
        >
          <q-item-section>
            <q-item-label>{{ campaign.name }}</q-item-label>
            <q-item-label caption>{{ campaign.status }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              icon="edit"
              @click.stop="openEditCampaignDialog(campaign.id)"
            />
            <q-btn
              flat
              icon="delete"
              color="negative"
              @click.stop="deleteCampaign(campaign.id)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCampaigns } from '../composables/useCampaigns'
import { useNotification } from '../composables/useNotification'

const { campaigns, loading, error, deleteCampaign, loadCampaigns } = useCampaigns()
const { notify } = useNotification()

// Estado
const searchTerm = ref('')

// Computed
const filteredCampaigns = computed(() => {
  if (!searchTerm.value) return campaigns.value
  const search = searchTerm.value.toLowerCase()
  return campaigns.value.filter(campaign => 
    campaign.name.toLowerCase().includes(search)
  )
})

// Métodos
const openAddCampaignDialog = () => {
  // Lógica para abrir o diálogo de adicionar campanha
}

const openEditCampaignDialog = (campaignId) => {
  // Lógica para abrir o diálogo de editar campanha
}

const handleDeleteCampaign = async (campaignId) => {
  try {
    await deleteCampaign(campaignId)
    notify({
      type: 'positive',
      message: 'Campanha removida com sucesso',
      position: 'top'
    })
  } catch (err) {
    notify({
      type: 'negative',
      message: 'Erro ao remover campanha',
      position: 'top'
    })
  }
}

// Carregar campanhas ao montar
loadCampaigns()
</script>

<style lang="scss" scoped>
.campaigns-container {
  padding: 16px;

  .q-card {
    margin-bottom: 16px;
  }
}
</style>
