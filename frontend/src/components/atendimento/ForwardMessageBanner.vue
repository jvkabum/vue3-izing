<template>
  <q-banner class="text-grey-8">
    <span class="text-bold text-h5">
      {{ messages.length }} de 10 mensagens
    </span>
    selecionadas para serem encaminhadas.
    
    <q-separator class="bg-grey-4" />
    
    <q-select
      dense
      class="q-my-md"
      ref="selectAutoCompleteContato"
      autofocus
      outlined
      rounded
      hide-dropdown-icon
      :loading="loading"
      v-model="selectedContactModel"
      :options="contacts"
      input-debounce="700"
      @filter="(val, update, abort) => $emit('search', val, update, abort)"
      use-input
      hide-selected
      fill-input
      clearable
      option-label="name"
      option-value="id"
      label="Localize e selecione o contato"
      hint="Digite no mínimo duas letras para localizar o contato. É possível selecionar apenas 1 contato!"
    >
      <template #option="{ opt, itemProps, itemEvents }">
        <q-item
          v-bind="itemProps"
          v-on="itemEvents"
          v-if="opt.name"
        >
          <q-item-section>
            <q-item-label>{{ opt.name }}</q-item-label>
            <q-item-label caption>{{ opt.number }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <template #action>
      <div class="row q-gutter-sm">
        <q-btn
          class="bg-padrao"
          flat
          color="negative"
          label="Cancelar"
          @click="$emit('cancel')"
        />
        <q-btn
          class="bg-padrao"
          flat
          color="positive"
          label="Enviar"
          icon="mdi-send"
          :loading="loading"
          :disable="!selectedContactModel"
          @click="$emit('send')"
        />
      </div>
    </template>
  </q-banner>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  messages: {
    type: Array,
    required: true,
    validator: (value) => value.length <= 10
  },
  selectedContact: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  contacts: {
    type: Array,
    required: true
  }
})

// Emits
const emit = defineEmits({
  'update:selectedContact': (contact) => {
    return contact?.id !== undefined
  },
  'search': null,
  'cancel': null,
  'send': null
})

// Computed
const selectedContactModel = computed({
  get: () => props.selectedContact,
  set: (value) => emit('update:selectedContact', value)
})
</script>

<style lang="scss" scoped>
.bg-padrao {
  &.q-btn {
    border-radius: 8px;
    padding: 8px 16px;
    
    &--flat {
      &.text-negative {
        color: var(--q-negative);
        
        &:hover {
          background: rgba(var(--q-negative-rgb), 0.1);
        }
      }
      
      &.text-positive {
        color: var(--q-positive);
        
        &:hover {
          background: rgba(var(--q-positive-rgb), 0.1);
        }
      }
    }
  }
}

.q-banner {
  border-radius: 8px;
  margin: 8px;
}

.q-select {
  .q-field__control {
    border-radius: 8px;
  }
}
</style>
