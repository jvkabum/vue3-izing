<template>
  <div class="row q-pa-sm" style="min-width: 350px; max-width: 350px">
    <div class="q-ma-sm">
      <div class="text-h6 q-mb-md">Filtros Avançados</div>

      <!-- Admin Toggle -->
      <q-toggle
        v-if="isAdmin"
        class="q-ml-lg"
        v-model="filterParams.showAll"
        label="(Admin) - Visualizar Todos"
        :class="{ 'q-mb-lg': filterParams.showAll }"
        @input="handleFilterChange"
      />

      <template v-if="!filterParams.showAll">
        <q-separator class="q-mb-md" />

        <!-- Seleção de Filas -->
        <q-select
          v-model="filterParams.queuesIds"
          :disable="filterParams.showAll"
          rounded
          dense
          outlined
          hide-bottom-space
          emit-value
          map-options
          multiple
          options-dense
          use-chips
          label="Filas"
          color="primary"
          :options="userQueues"
          :input-debounce="700"
          option-value="id"
          option-label="queue"
          @input="handleFilterChange"
          input-style="width: 300px; max-width: 300px;"
        />

        <!-- Status Checkboxes -->
        <q-list dense class="q-my-md">
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox
                v-model="filterParams.status"
                val="open"
                color="primary"
                keep-color
                @input="handleFilterChange"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Abertos</q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox
                v-model="filterParams.status"
                val="pending"
                color="negative"
                keep-color
                @input="handleFilterChange"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Pendentes</q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox
                v-model="filterParams.status"
                val="closed"
                color="positive"
                keep-color
                @input="handleFilterChange"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Resolvidos</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator class="q-mb-md" />

        <!-- Toggles Adicionais -->
        <q-toggle
          v-model="filterParams.withUnreadMessages"
          label="Somente Tickets com mensagens não lidas"
          @input="handleFilterChange"
        />

        <q-toggle
          v-model="filterParams.isNotAssignedUser"
          label="Somente Tickets não atribuidos (sem usuário definido)"
          @input="handleFilterChange"
        />

        <q-separator class="q-my-md" spaced />
      </template>

      <!-- Botão Fechar -->
      <q-btn
        class="float-right q-my-md"
        color="negative"
        label="Fechar"
        push
        rounded
        v-close-popup
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAtendimentoFilters } from '../../composables/useAtendimentoFilters'

// Emits
const emit = defineEmits(['filter'])

// Composables
const { filterParams, userQueues } = useAtendimentoFilters()

// Computed
const isAdmin = computed(() => 
  localStorage.getItem('profile') === 'admin'
)

// Métodos
const handleFilterChange = () => {
  emit('filter')
}
</script>

<style lang="scss" scoped>
.q-toggle {
  .q-toggle__inner {
    min-width: 45px;
  }
}
</style>
