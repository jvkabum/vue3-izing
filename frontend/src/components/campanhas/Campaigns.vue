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
import { useCampaigns } from '../../composables/campanhas/useCampaigns'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import { useCampaignDialog } from '../../composables/campanhas/useCampaignDialog'
import { useSearch } from '../../composables/comum/useSearch'
import CampaignList from './CampaignList.vue'
import CampaignDialog from './CampaignDialog.vue'

// Composables
const { campaigns, loading, error, deleteCampaign, loadCampaigns, saveCampaign } = useCampaigns()
const { notifySuccess, notifyError } = useNotificationSystem()
const { isDialogOpen, editingCampaign, openAddDialog, openEditDialog, closeDialog } = useCampaignDialog()
const { searchTerm, filteredItems } = useSearch(campaigns)

// Métodos
const handleDeleteCampaign = async (campaign) => {
  try {
    await deleteCampaign(campaign.id)
    notifySuccess('Campanha removida com sucesso')
  } catch (err) {
    notifyError('Erro ao remover campanha')
  }
}

const handleSaveCampaign = async (campaignData) => {
  try {
    await saveCampaign(campaignData)
    notifySuccess(`Campanha ${campaignData.id ? 'atualizada' : 'criada'} com sucesso`)
    closeDialog()
  } catch (err) {
    notifyError('Erro ao salvar campanha')
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
