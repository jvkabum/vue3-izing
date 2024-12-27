<template>
  <q-select
    v-model="selectedWallets"
    square
    borderless
    multiple
    :max-values="1"
    :options="options"
    use-chips
    option-value="id"
    option-label="name"
    emit-value
    map-options
    dropdown-icon="add"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <!-- Option Template -->
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

    <!-- Selected Item Template -->
    <template #selected-item="{ opt }">
      <q-chip
        dense
        square
        color="white"
        text-color="primary"
        class="q-ma-xs row col-12 text-body1"
      >
        {{ opt.name }}
      </q-chip>
    </template>

    <!-- No Options Template -->
    <template #no-option="{ itemProps, itemEvents }">
      <q-item v-bind="itemProps" v-on="itemEvents">
        <q-item-section>
          <q-item-label class="text-negative text-bold">
            Ops... Sem carteiras disponíveis!!
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:model-value'])

const selectedWallets = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  selectedWallets.value = newValue
})
</script>

<style lang="scss" scoped>
.q-chip {
  background-color: var(--q-primary);
  color: white;

  &:hover {
    background-color: var(--q-primary-dark);
  }
}
</style>
