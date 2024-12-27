import { reactive, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'

export function useForm() {
  const form = reactive({
    email: '',
    password: ''
  })

  const isPwd = ref(true)

  const rules = {
    email: { required, email },
    password: { required }
  }

  const v$ = useVuelidate(rules, form)

  return {
    form,
    isPwd,
    v$
  }
}
