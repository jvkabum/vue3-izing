import { computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, url } from '@vuelidate/validators'

export function useApiValidation(api) {
  const rules = computed(() => ({
    api: {
      name: { required },
      sessionId: { required },
      urlServiceStatus: { 
        isValidURL: value => !value || url(value)
      },
      urlMessageStatus: { 
        isValidURL: value => !value || url(value)
      }
    }
  }))

  const v$ = useVuelidate(rules, { api })

  return {
    v$
  }
}
