<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Gerenciar Campanhas</div>
      <q-separator class="q-my-md" />
      
      <!-- Barra de busca e botão adicionar -->
      <div class="row items-center q-mb-md">
        <q-input
          v-model="searchTerm"
          label="Buscar Campanha"
          outlined
          dense
          class="col"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        
        <q-btn
          label="Adicionar Campanha"
          color="primary"
          class="q-ml-sm"
          @click="openAddDialog"
          icon="add"
        />
      </div>

      <!-- Loading e Error states -->
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner color="primary" size="3em" />
      </div>

      <div v-else-if="error" class="text-negative q-pa-md">
        {{ error }}
      </div>

      <!-- Lista de Campanhas -->
      <campaign-list
        v-else
        :campaigns="filteredItems"
        @edit="openEditDialog"
        @delete="handleDeleteCampaign"
        @click="openEditDialog"
      />

      <!-- Diálogo de Campanha -->
      <campaign-dialog
        v-model:isOpen="isDialogOpen"
        :campaign="editingCampaign"
        @save="handleSaveCampaign"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCampaigns } from '../composables/useCampaigns'
import { useNotification } from '../composables/useNotification'
import { useCampaignDialog } from '../composables/useCampaignDialog'
import { useSearch } from '../composables/useSearch'
import CampaignList from './campaigns/CampaignList.vue'
import CampaignDialog from './campaigns/CampaignDialog.vue'

// Composables
const { campaigns, loading, error, deleteCampaign, loadCampaigns, saveCampaign } = useCampaigns()
const { notify } = useNotification()
const { isDialogOpen, editingCampaign, openAddDialog, openEditDialog, closeDialog } = useCampaignDialog()
const { searchTerm, filteredItems } = useSearch(campaigns)

// Métodos
const handleDeleteCampaign = async (campaign) => {
  try {
    await deleteCampaign(campaign.id)
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

const handleSaveCampaign = async (campaignData) => {
  try {
    await saveCampaign(campaignData)
    notify({
      type: 'positive',
      message: `Campanha ${campaignData.id ? 'atualizada' : 'criada'} com sucesso`,
      position: 'top'
    })
    closeDialog()
  } catch (err) {
    notify({
      type: 'negative',
      message: 'Erro ao salvar campanha',
      position: 'top'
    })
  }
}

// Lifecycle
onMounted(() => {
  loadCampaigns()
})
</script>

<style lang="scss" scoped>
.q-card {
  .q-card-section {
    padding: 20px;
  }
}
</style>
