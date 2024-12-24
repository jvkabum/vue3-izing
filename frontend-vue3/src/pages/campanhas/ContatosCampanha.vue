<template>
  <div v-if="userProfile === 'admin'">
    <!-- Header -->
    <q-card flat class="q-ma-sm">
      <q-card-section>
        <div class="row text-h6">
          Campanha: {{ route.params.campanha.name }}
        </div>
        <div class="row text-caption">
          Início: {{ formatDate(route.params.campanha.start) }} - Status: {{ route.params.campanha.status }}
        </div>
        <q-btn
          rounded
          class="absolute-top-right q-ma-md"
          icon="mdi-arrow-left"
          label="Listar Campanhas"
          color="black"
          @click="router.push({ name: 'campanhas' })"
        />
      </q-card-section>
    </q-card>

    <!-- Tabela de Contatos -->
    <CampanhaContatosTable
      :contatos="contatosCampanha"
      :loading="loading"
      :status="route.params.campanha.status"
      :pagination="pagination"
      @refresh="listarContatosCampanha"
      @clear="deletarTodosContatosCampanha"
      @add="modalAddContatosCampanha = true"
      @delete="deletarContatoCampanha"
    />

    <!-- Modal Adicionar Contatos -->
    <CampanhaAddContatosModal
      v-model="modalAddContatosCampanha"
      :contatos="contatosAdd"
      :etiquetas="etiquetas"
      :usuarios="usuarios"
      :loading="loading"
      v-model:filters="pesquisa"
      @search="listarAddContatos"
      @save="addContatosCampanha"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCampanhaContatos } from '../../composables/useCampanhaContatos'
import CampanhaContatosTable from '../../components/campanhas/CampanhaContatosTable.vue'
import CampanhaAddContatosModal from '../../components/campanhas/CampanhaAddContatosModal.vue'

// Router
const route = useRoute()
const router = useRouter()

// Estado
const userProfile = ref(localStorage.getItem('profile'))

// Composables
const {
  loading,
  contatosCampanha,
  contatosAdd,
  etiquetas,
  usuarios,
  modalAddContatosCampanha,
  pesquisa,
  formatDate,
  listarAddContatos,
  listarContatosCampanha,
  addContatosCampanha,
  deletarContatoCampanha,
  deletarTodosContatosCampanha,
  initialize
} = useCampanhaContatos(route.params.campanhaId)

// Lifecycle
onMounted(async () => {
  if (!route.params.campanha) {
    router.push({ name: 'campanhas' })
    return
  }

  await initialize()
})
</script>

<style lang="scss" scoped>
.my-sticky-dynamic {
  height: 75vh;

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: #fff;
  }

  thead tr th {
    position: sticky;
    z-index: 1;
  }

  thead tr:last-child th {
    top: 63px;
  }

  thead tr:first-child th {
    top: 0;
  }
}

#tabela-contatos-atendimento {
  thead th {
    height: 55px;
  }
}
</style>
