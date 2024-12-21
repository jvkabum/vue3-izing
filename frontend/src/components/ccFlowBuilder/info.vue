<template>
  <q-dialog v-model="dialogVisible" width="70%" title="Informações do Fluxo">
    <q-alert
      title="Instruções"
      type="warning"
      description="Os dados abaixo podem ser salvos para carregar o fluxo posteriormente"
      show-icon
      close-text="Entendi"
    />
    
    <br />
    
    <codemirror
      :value="flowData"
      :options="editorOptions"
      class="code"
    />
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const dialogVisible = ref(false)

const editorOptions = {
  mode: { name: 'javascript', json: true },
  lineNumbers: true
}

const flowData = computed(() => 
  JSON.stringify(props.data, null, 4)
)

const init = () => {
  dialogVisible.value = true
}

defineExpose({
  init
})
</script>
