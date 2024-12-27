<template>
  <div v-if="parsedContact.name" class="contact-card">
    <div v-if="parsedContact.photo">
      <img :src="'data:image/jpeg;base64,' + parsedContact.photo" alt="Contact Photo" />
    </div>
    <div>
      <h3>{{ parsedContact.name }}</h3>
      <p>{{ parsedContact.number }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useContato } from 'src/composables/atendimento/useContato'

const props = defineProps({
  mensagem: {
    type: Object,
    required: true
  }
})

const { parseVCard } = useContato()
const parsedContact = ref({
  name: '',
  number: '',
  photo: ''
})

onMounted(() => {
  if (props.mensagem?.body) {
    parsedContact.value = parseVCard(props.mensagem.body)
  }
})
</script>

<style scoped>
.contact-card {
  border: 1px solid #ccc;
  padding: 1em;
  margin: 1em 0;
  border-radius: 8px;
  background: #f9f9f9;
}
.contact-card img {
  max-width: 100px;
  border-radius: 50%;
}
</style>
