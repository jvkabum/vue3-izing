import { configure } from '@vuelidate/core'
import { createI18n } from 'vue-i18n'

/* Messages for validation */
const messages = {
  pt: {
    validations: {
      required: '{field} é obrigatório',
      email: '{field} é inválido.',
      minValue: '{field} deve ser maior que {min}',
      minLength: '{field} deve possui no mínimo {min} carateres',
      maxLength: '{field} deve possui no máximo {max} carateres',
      validaData: 'Data inválida'
    }
  }
}

const mapNames = {
  email: 'E-mail',
  name: 'Nome',
  nome: 'Nome',
  username: 'Usuário'
}

// Create i18n instance
const i18n = createI18n({
  locale: 'pt',
  messages
})

// Configure vuelidate
configure({
  messageClassName: 'vuelidate-message',
  validationKeys: mapNames
})

export { i18n }

// Boot file
export default ({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
}
