<template>
  <div class="message-field">
    <div class="field-header">
      <div class="field-title">{{ title }}</div>
      <q-btn
        flat
        round
        dense
        icon="add"
        @click="addMessage"
      />
    </div>

    <div class="message-list">
      <div
        v-for="(message, index) in modelValue"
        :key="index"
        class="message-item"
      >
        <q-input
          v-model="message.text"
          type="textarea"
          outlined
          dense
          autogrow
          :placeholder="placeholder"
          @update:model-value="handleMessageChange(index, $event)"
        />

        <div class="message-actions">
          <q-btn
            flat
            round
            dense
            icon="delete"
            @click="removeMessage(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Mensagens'
  },
  placeholder: {
    type: String,
    default: 'Digite sua mensagem...'
  }
})

const emit = defineEmits(['update:modelValue'])

const addMessage = () => {
  const newValue = [...props.modelValue, { text: '' }]
  emit('update:modelValue', newValue)
}

const removeMessage = (index) => {
  const newValue = [...props.modelValue]
  newValue.splice(index, 1)
  emit('update:modelValue', newValue)
}

const handleMessageChange = (index, text) => {
  const newValue = [...props.modelValue]
  newValue[index].text = text
  emit('update:modelValue', newValue)
}
</script>

<style lang="scss" scoped>
.message-field {
  .field-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .field-title {
      font-weight: 500;
    }
  }

  .message-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .message-item {
    position: relative;
    
    .message-actions {
      position: absolute;
      top: 4px;
      right: 4px;
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover {
      .message-actions {
        opacity: 1;
      }
    }
  }
}
</style>
