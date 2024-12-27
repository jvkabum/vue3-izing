<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    @hide="fecharModal(emit)"
  >
    <q-card
      class="q-pa-md"
      style="width: 500px"
    >
      <q-card-section>
        <div class="text-h6">Criar Ticket</div>
      </q-card-section>
      <q-card-section>
        <q-select
          ref="selectAutoCompleteContato"
          autofocus
          square
          outlined
          filled
          hide-dropdown-icon
          :loading="loading"
          v-model="contatoSelecionado"
          :options="contatos"
          input-debounce="700"
          @filter="localizarContato"
          use-input
          hide-selected
          fill-input
          option-label="name"
          option-value="id"
          label="Localizar Contato"
          hint="Digite no mínimo duas letras para localizar o contato."
        >
          <template #before-options>
            <q-btn
              color="primary"
              no-caps
              padding
              ripple
              class="full-width no-border-radius"
              outline
              icon="add"
              label="Adicionar Contato"
              @click="modalContato = true"
            />
          </template>
          <template #option="scope">
            <q-item
              v-bind="scope.itemProps"
              v-on="scope.itemEvents"
              v-if="scope.opt.name"
            >
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.number }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-pr-md"
      >
        <q-btn
          label="Sair"
          color="negative"
          v-close-popup
          class="q-px-md q-mr-lg"
        />
        <q-btn
          label="Salvar"
          class="q-px-md"
          color="primary"
          @click="criarTicket(emit)"
        />
      </q-card-actions>
    </q-card>
    <ContatoModal
      v-model="modalContato"
      @contatoModal:contato-criado="contatoCriadoNotoTicket"
    />
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useNovoTicket } from 'src/composables/atendimento/useNovoTicket'
import ContatoModal from 'src/pages/contatos/ContatoModal'

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const selectAutoCompleteContato = ref(null)

const {
  contatoSelecionado,
  contatos,
  modalContato,
  loading,
  fecharModal,
  localizarContato,
  contatoCriadoNotoTicket,
  criarTicket
} = useNovoTicket()
</script>
