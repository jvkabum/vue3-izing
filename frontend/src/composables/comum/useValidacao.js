import { ref } from 'vue'

export function useValidation() {
  const errors = ref({})
  const loading = ref(false)

  const rules = {
    required: (value) => !!value || 'Campo obrigatório',
    email: (value) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return !value || pattern.test(value) || 'E-mail inválido'
    },
    phone: (value) => {
      const pattern = /^\d{10,11}$/
      return !value || pattern.test(value) || 'Telefone inválido'
    },
    minLength: (min) => (value) => {
      return !value || value.length >= min || `Mínimo de ${min} caracteres`
    },
    maxLength: (max) => (value) => {
      return !value || value.length <= max || `Máximo de ${max} caracteres`
    },
    numeric: (value) => {
      return !value || !isNaN(value) || 'Deve ser um número'
    }
  }

  const validate = (fields) => {
    loading.value = true
    errors.value = {}
    let isValid = true

    try {
      Object.entries(fields).forEach(([field, config]) => {
        const { value, rules: fieldRules = [] } = config
        
        for (const rule of fieldRules) {
          const result = rule(value)
          if (result !== true) {
            errors.value[field] = result
            isValid = false
            break
          }
        }
      })
    } catch (err) {
      console.error('Erro na validação:', err)
      isValid = false
    } finally {
      loading.value = false
    }

    return isValid
  }

  const clearErrors = () => {
    errors.value = {}
  }

  const hasErrors = () => {
    return Object.keys(errors.value).length > 0
  }

  return {
    errors,
    loading,
    rules,
    validate,
    clearErrors,
    hasErrors
  }
} 