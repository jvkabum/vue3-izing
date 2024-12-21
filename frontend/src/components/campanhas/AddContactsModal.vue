<template>
  <q-dialog
    persistent
    v-model="modelValue"
    @hide="$emit('update:modelValue', false)"
  >
    <q-card style="min-width: 80vw; width: 80vw">
      <!-- Filtros -->
      <q-card-section class="q-pt-none q-pt-md">
        <fieldset class="rounded-all">
          <legend class="q-px-sm">Filtros (Data criação do contato)</legend>
          <div class="row q-gutter-md items-end">
            <!-- Data Início -->
            <div class="col-grow">
              <label>Início</label>
              <DatePick
                dense
                rounded
                v-model="filters.startDate"
                @update:model-value="handleFilterChange"
              />
            </div>

            <!-- Data Final -->
            <div class="col-grow">
              <label>Final</label>
              <DatePick
                dense
                rounded
                v-model="filters.endDate"
                @update:model-value="handleFilterChange"
              />
            </div>

            <!-- Estados -->
            <div class="col-xs-12 col-sm-4 grow text-center">
              <q-select
                label="Estado (s)"
                dense
                rounded
                outlined
                v-model="filters.ddds"
                multiple
                :options="estadosBR"
                use-chips
                option-value="sigla"
                option-label="nome"
                emit-value
                map-options
                dropdown-icon="add"
                @update:model-value="handleFilterChange"
              >
                <template #option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                  <q-item v-bind="itemProps" v-on="itemEvents">
                    <q-item-section>
                      <q-item-label v-html="opt.nome"></q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox :value="selected" @input="toggleOption(opt)" />
                    </q-item-section>
                  </q-item>
                </template>
                <template #selected-item="{ opt }">
                  <q-badge
                    dense
                    rounded
                    color="grey-3"
                    text-color="primary"
                    class="q-ma-xs text-body1"
                    :label="opt.nome"
                  />
                </template>
              </q-select>
            </div>

            <!-- Etiquetas -->
            <div class="col-xs-12 col-sm-4 grow text-center">
              <q-select
                outlined
                label="Etiqueta (a)"
                dense
                rounded
                v-model="filters.tags"
                multiple
                :options="etiquetas"
                use-chips
                option-value="id"
                option-label="tag"
                emit-value
                map-options
                dropdown-icon="add"
                @update:model-value="handleFilterChange"
              >
                <template #option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                  <q-item v-bind="itemProps" v-on="itemEvents">
                    <q-item-section>
                      <q-item-label v-html="opt.tag"></q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox :value="selected" @input="toggleOption(opt)" />
                    </q-item-section>
                  </q-item>
                </template>
                <template #selected-item="{ opt }">
                  <q-chip
                    dense
                    rounded
                    color="white"
                    text-color="primary"
                    class="q-ma-xs text-body1"
                  >
                    <q-icon
                      :style="`color: ${opt.color}`"
                      name="mdi-pound-box-outline"
                      size="28px"
                      class="q-mr-sm"
                    />
                    {{ opt.tag }}
                  </q-chip>
                </template>
              </q-select>
            </div>

            <!-- Carteira -->
            <div class="col-xs-12 col-sm-4 grow text-center">
              <q-select
                outlined
                rounded
                label="Carteira"
                dense
                v-model="filters.wallets"
                multiple
                :options="usuarios"
                use-chips
                option-value="id"
                option-label="name"
                emit-value
                map-options
                dropdown-icon="add"
                @update:model-value="handleFilterChange"
              >
                <template #option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                  <q-item v-bind="itemProps" v-on="itemEvents">
                    <q-item-section>
                      <q-item-label v-html="opt.name"></q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox :value="selected" @input="toggleOption(opt)" />
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Busca -->
            <div class="col-xs-12 col-sm-4 grow text-center">
              <q-input
                style="width: 300px"
                outlined
                dense
                rounded
                v-model="filters.searchParam"
                clearable
                placeholder="Filtrar Nome ou Telefone"
                @update:model-value="handleFilterChange"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <!-- Botão Gerar -->
            <div class="col-grow text-right">
              <q-btn
                class="q-mr-sm"
                color="primary"
                rounded
                label="Gerar"
                icon="refresh"
                @click="$emit('search')"
              />
            </div>
          </div>
        </fieldset>
      </q-card-section>

      <!-- Tabela de Contatos -->
      <q-card-section>
        <q-table
          class="my-sticky-dynamic q-ma-sm"
          style="height: 50vh"
          title="Contatos"
          :data="contatos"
          :columns="columns"
          :loading="loading"
          row-key="number"
          selection="multiple"
          v-model:selected="selectedContacts"
          :pagination="pagination"
          :rows-per-page-options="[0]"
          separator="cell"
        >
          <template #top>
            <div class="row col-4 q-table__title items-center">
              Selecionar Contatos
            </div>
            <q-space />
            <q-btn
              rounded
              class="q-ml-md"
              color="negative"
              label="Cancelar"
              @click="$emit('update:modelValue', false)"
            />
            <q-btn
              rounded
              class="q-ml-md"
              color="positive"
              icon="save"
              label="Adicionar"
              @click="$emit('save', selectedContacts)"
            />
          </template>

          <template #body-cell-profilePicUrl="props">
            <q-td>
              <q-avatar style="border: 1px solid #9e9e9ea1 !important">
                <q-icon
                  v-if="!props.value"
                  name="mdi-account"
                  size="1.5em"
                  color="grey-5"
                />
                <q-img
                  v-else
                  :src="props.value"
                  style="max-width: 150px"
                >
                  <template #error>
                    <q-icon
                      name="mdi-account"
                      size="1.5em"
                      color="grey-5"
                    />
                  </template>
                </q-img>
              </q-avatar>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { estadosBR } from '../../utils/constants'
import DatePick from '../cDatePick.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  contatos: {
    type: Array,
    required: true
  },
  etiquetas: {
    type: Array,
    required: true
  },
  usuarios: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'update:modelValue',
  'update:filters',
  'search',
  'save'
])

// Estado
const selectedContacts = ref([])

// Colunas da tabela
const columns = [
  { 
    name: 'profilePicUrl', 
    label: '', 
    field: 'profilePicUrl', 
    style: 'width: 50px', 
    align: 'center' 
  },
  { 
    name: 'name', 
    label: 'Nome', 
    field: 'name', 
    align: 'left', 
    style: 'width: 300px' 
  },
  { 
    name: 'number', 
    label: 'WhatsApp', 
    field: 'number', 
    align: 'center', 
    style: 'width: 300px' 
  },
  {
    name: 'tags',
    label: 'Etiquetas',
    field: 'tags',
    style: 'width: 500px',
    align: 'left',
    format: (v) => {
      if (v) {
        const strs = v.map(i => i.tag)
        return strs.join(', ')
      }
      return ''
    }
  },
  { 
    name: 'estado', 
    label: 'Estado', 
    field: 'number', 
    style: 'width: 500px', 
    align: 'left', 
    format: (v) => {
      const ddd = v.substring(2, 4)
      return estadosBR.find(e => e.sigla === estadoPorDdd[ddd])?.nome || ''
    }
  }
]

// Paginação
const pagination = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

// Métodos
const handleFilterChange = () => {
  emit('update:filters', props.filters)
}

// Reset seleção quando o modal fecha
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    selectedContacts.value = []
  }
})
</script>

<style lang="scss" scoped>
.my-sticky-dynamic {
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
</style>
