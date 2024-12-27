<template>
  <q-input
    ref="inputRef"
    v-model="inputValue"
    :label="label"
    :error="!!errorMessage || (validateOnDirty && isDirty && !isValid)"
    :error-message="errorMessage || validationError"
    :rules="validationRules"
    :hint="hint"
    :disable="disable"
    :readonly="readonly"
    :autofocus="autofocus"
    :maxlength="maxLength"
    :counter="showCounter"
    outlined
    dense
    @update:model-value="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    @keyup.enter="handleEnter"
    v-bind="$attrs"
  >
    <!-- Slot para ícone à esquerda -->
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>

    <!-- Slot para ícone à direita -->
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>

    <!-- Slots dinâmicos -->
    <template 
      v-for="(_, name) in $slots" 
      :key="name"
      #[name]="slotData"
      v-if="name !== 'prepend' && name !== 'append'"
    >
      <slot :name="name" v-bind="slotData" />
    </template>
  </q-input>
</template>

<script setup>
import { computed } from 'vue'
import { useInput } from '../../composables/useInput'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  rules: {
    type: Array,
    default: () => []
  },
  errorMessage: {
    type: String,
    default: ''
  },
  validateOnDirty: {
    type: Boolean,
    default: false
  },
  disable: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  autofocus: {
    type: Boolean,
    default: false
  },
  maxLength: {
    type: [Number, String],
    default: undefined
  },
  showCounter: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue',
  'blur',
  'focus',
  'enter',
  'validation'
])

const {
  inputRef,
  inputValue,
  isDirty,
  handleInput,
  validate,
  resetValidation,
  focus,
  blur,
  select,
  getNativeElement
} = useInput(props, emit)

// Computed
const validationRules = computed(() => {
  const rules = [...props.rules]
  
  if (props.required) {
    rules.unshift(val => !!val || 'Campo obrigatório')
  }
  
  if (props.maxLength) {
    rules.push(val => 
      !val || String(val).length <= props.maxLength || 
      `Máximo de ${props.maxLength} caracteres`
    )
  }
  
  return rules
})

const isValid = computed(() => {
  if (!inputRef.value) return true
  return !inputRef.value.hasError
})

const validationError = computed(() => {
  if (!inputRef.value || !inputRef.value.hasError) return ''
  return inputRef.value.errorMessage
})

// Methods
const handleBlur = (e) => {
  emit('blur', e)
}

const handleFocus = (e) => {
  emit('focus', e)
}

const handleEnter = (e) => {
  emit('enter', e)
}

// Expose methods
defineExpose({
  validate,
  resetValidation,
  focus,
  blur,
  select,
  getNativeElement
})
</script>

<style lang="scss" scoped>
.q-field {
  &--error {
    .q-field__bottom {
      padding-top: 4px;
      color: var(--q-negative);
    }
  }
}
</style>
