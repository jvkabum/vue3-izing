<template>
  <div class="options-field">
    <div class="field-header">
      <div class="field-title">{{ title }}</div>
      <q-btn
        flat
        round
        dense
        icon="add"
        @click="addOption"
      />
    </div>

    <div class="options-list">
      <div
        v-for="(option, index) in modelValue"
        :key="index"
        class="option-item"
      >
        <div class="option-content">
          <q-input
            v-model="option.label"
            outlined
            dense
            placeholder="Texto da opção"
            @update:model-value="handleOptionChange(index, 'label', $event)"
          />

          <q-input
            v-model="option.value"
            outlined
            dense
            placeholder="Valor"
            @update:model-value="handleOptionChange(index, 'value', $event)"
          />

          <q-select
            v-model="option.action"
            :options="actionOptions"
            outlined
            dense
            emit-value
            map-options
            placeholder="Ação"
            @update:model-value="handleOptionChange(index, 'action', $event)"
          />
        </div>

        <div class="option-actions">
          <q-btn
            flat
            round
            dense
            icon="delete"
            @click="removeOption(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Opções'
  }
})

const emit = defineEmits(['update:modelValue'])

const actionOptions = [
  { label: 'Ir para nó', value: 'goto' },
  { label: 'Finalizar', value: 'end' },
  { label: 'Executar função', value: 'function' }
]

const addOption = () => {
  const newValue = [
    ...props.modelValue,
    { label: '', value: '', action: '' }
  ]
  emit('update:modelValue', newValue)
}

const removeOption = (index) => {
  const newValue = [...props.modelValue]
  newValue.splice(index, 1)
  emit('update:modelValue', newValue)
}

const handleOptionChange = (index, field, value) => {
  const newValue = [...props.modelValue]
  newValue[index][field] = value
  emit('update:modelValue', newValue)
}
</script>

<style lang="scss" scoped>
.options-field {
  .field-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .field-title {
      font-weight: 500;
    }
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .option-item {
    position: relative;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 4px;

    .option-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .option-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover {
      .option-actions {
        opacity: 1;
      }
    }
  }
}
</style>
