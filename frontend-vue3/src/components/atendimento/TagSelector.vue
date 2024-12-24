<template>
  <q-select
    v-model="selectedTags"
    square
    borderless
    multiple
    :options="options"
    use-chips
    option-value="id"
    option-label="tag"
    emit-value
    map-options
    dropdown-icon="add"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <!-- Option Template -->
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

    <!-- Selected Item Template -->
    <template #selected-item="{ opt }">
      <q-chip
        dense
        square
        color="white"
        text-color="primary"
        class="q-ma-xs row col-12 text-body1"
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

    <!-- No Options Template -->
    <template #no-option="{ itemProps, itemEvents }">
      <q-item v-bind="itemProps" v-on="itemEvents">
        <q-item-section>
          <q-item-label class="text-negative text-bold">
            Ops... Sem etiquetas criadas!
          </q-item-label>
          <q-item-label caption>
            Cadastre novas etiquetas na administração de sistemas.
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

const selectedTags = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  selectedTags.value = newValue
})
</script>
