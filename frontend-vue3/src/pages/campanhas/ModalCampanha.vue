<template>
  <q-dialog
    persistent
    :value="modalCampanha"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <!-- Template anterior completo -->
    <q-card
      class="q-pa-sm"
      style="min-width: 70vw;"
    >
      <!-- ... resto do template ... -->
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { Picker, data as emojiData } from 'emoji-mart-vue-fast'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { parseISO, startOfDay } from 'date-fns'
import { CriarCampanha, AlterarCampanha } from 'src/service/campanhas'

const props = defineProps({
  modalCampanha: {
    type: Boolean,
    default: false
  },
  campanhaEdicao: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits([
  'update:modalCampanha',
  'update:campanhaEdicao',
  'modal-campanha-editada',
  'modal-campanha-criada'
])

const store = useStore()
const $q = useQuasar()

const variaveis = ref([
  { label: 'Nome', value: '{{name}}' },
  { label: 'Saudação', value: '{{greeting}}' }
])

const loading = ref(false)
const arquivos = ref([])

const campanha = reactive({
  name: null,
  start: null,
  mediaUrl: null,
  message1: null,
  message2: null,
  message3: null,
  sessionId: null,
  delay: 61
})

// Refs para os textareas
const messageRefs = {
  message1: ref(null),
  message2: ref(null),
  message3: ref(null)
}

// Computed properties
const cSessions = computed(() => store.getters.whatsapps.filter(w => w.type === 'whatsapp' && !w.isDeleted))

const cArquivoName = computed(() => {
  if (!campanha.mediaUrl) return ''
  const split = campanha.mediaUrl.split('/')
  return split[split.length - 1]
})

// Validações
const rules = {
  campanha: {
    name: { required },
    start: { 
      required,
      isValidDate: v => startOfDay(new Date(parseISO(v))).getTime() >= startOfDay(new Date()).getTime()
    },
    message1: { required },
    message2: { required },
    message3: { required },
    sessionId: { required }
  }
}

const v$ = useVuelidate(rules, { campanha })

// Methods
const resetarCampanha = () => {
  Object.assign(campanha, {
    id: null,
    name: null,
    start: null,
    message1: null,
    message2: null,
    message3: null,
    mediaUrl: null,
    userId: null,
    delay: 61,
    sessionId: null
  })
}

const fecharModal = () => {
  resetarCampanha()
  emit('update:campanhaEdicao', { id: null })
  emit('update:modalCampanha', false)
}

const abrirModal = () => {
  if (props.campanhaEdicao.id) {
    Object.assign(campanha, props.campanhaEdicao)
  } else {
    resetarCampanha()
  }
}

const onInsertSelectEmoji = (emoji, ref) => {
  if (!emoji.native) return
  
  const tArea = messageRefs[ref].value
  if (!tArea) return

  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const tmpStr = tArea.value

  campanha[ref] = tmpStr.substring(0, startPos) + emoji.native + tmpStr.substring(endPos, tmpStr.length)

  setTimeout(() => {
    tArea.selectionStart = tArea.selectionEnd = startPos + emoji.native.length
  }, 10)
}

const onInsertSelectVariable = (variable, ref, messageField) => {
  const tArea = messageRefs[ref].value
  if (!tArea || !variable) return

  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const originalText = tArea.value

  const newText = originalText.substring(0, startPos) + variable + originalText.substring(endPos)
  campanha[messageField] = newText

  const newCursorPos = startPos + variable.length
  tArea.setSelectionRange(newCursorPos, newCursorPos)
}

const onRejectedFiles = () => {
  $q.notify({
    html: true,
    message: `Ops... Ocorreu um erro! <br>
    <ul>
      <li>Arquivo deve ter no máximo 10MB.</li>
      <li>Priorize o envio de imagem ou vídeo.</li>
    </ul>`,
    type: 'negative',
    progress: true,
    position: 'top',
    actions: [{ icon: 'close', round: true, color: 'white' }]
  })
}

const handleCampanha = async () => {
  if (campanha.message1 === campanha.message2 || 
      campanha.message1 === campanha.message3 || 
      campanha.message2 === campanha.message3) {
    $q.notify({
      type: 'negative',
      message: 'As mensagens não podem ser iguais'
    })
    return
  }

  if (campanha.delay < 61) {
    $q.notify({
      type: 'negative',
      message: 'O campo delay deve ser no mínimo 61'
    })
    return
  }

  const isValid = await v$.value.$validate()
  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Verifique se todas os campos obrigatórios estão preenchidos'
    })
    return
  }

  try {
    loading.value = true
    const campanhaData = { ...campanha }
    const medias = new FormData()
    
    Object.keys(campanhaData).forEach(key => {
      medias.append(key, campanhaData[key])
    })
    medias.append('medias', arquivos.value)

    if (campanha.id) {
      const { data } = await AlterarCampanha(medias, campanha.id)
      emit('modal-campanha-editada', data)
      $q.notify({
        type: 'info',
        progress: true,
        position: 'top',
        textColor: 'black',
        message: 'Campanha editada!',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } else {
      const { data } = await CriarCampanha(medias)
      emit('modal-campanha-criada', data)
      $q.notify({
        type: 'positive',
        progress: true,
        position: 'top',
        message: 'Campanha criada!',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    }
    loading.value = false
    fecharModal()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Algum problema ao criar campanha',
      caption: error.message
    })
  }
}
</script>

<style lang="scss">
.border-error {
  border: 3px solid red;
  background: red !important;
}
</style>
