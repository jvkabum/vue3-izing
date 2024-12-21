<template>
  <div class="node-form">
    <q-form @submit="handleSubmit">
      <q-input
        v-model="form.name"
        label="Nome do Nó"
        outlined
        dense
        :rules="[val => !!val || 'Campo obrigatório']"
      />

      <div v-if="form.type === 'configurations'" class="config-section">
        <div class="section-title">Configurações</div>
        
        <q-input
          v-model="form.configurations.notOptionsSelectMessage.message"
          label="Mensagem sem opção"
          type="textarea"
          outlined
          dense
        />

        <q-input
          v-model.number="form.configurations.notResponseMessage.time"
          label="Tempo sem resposta (min)"
          type="number"
          outlined
          dense
        />

        <q-input
          v-model="form.configurations.welcomeMessage.message"
          label="Mensagem de boas vindas"
          type="textarea"
          outlined
          dense
        />
      </div>

      <template v-else>
        <div class="section">
          <div class="section-title">Interações</div>
          <div v-for="(interaction, idx) in form.interactions" :key="idx">
            <q-input
              v-model="interaction.message"
              label="Mensagem"
              outlined
              dense
            >
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  @click="removeInteraction(idx)"
                />
              </template>
            </q-input>
          </div>
          <q-btn
            flat
            label="Adicionar Interação"
            icon="add"
            @click="addInteraction"
          />
        </div>

        <div class="section">
          <div class="section-title">Condições</div>
          <div v-for="(condition, idx) in form.conditions" :key="idx">
            <q-input
              v-model="condition.label"
              label="Condição"
              outlined
              dense
            >
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  @click="removeCondition(idx)"
                />
              </template>
            </q-input>
          </div>
          <q-btn
            flat
            label="Adicionar Condição"
            icon="add"
            @click="addCondition"
          />
        </div>
      </template>

      <div class="actions">
        <q-btn
          flat
          label="Cancelar"
          @click="$emit('cancel')"
        />
        <q-btn
          type="submit"
          color="primary"
          label="Salvar"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const form = ref({
  ...props.node,
  configurations: {
    notOptionsSelectMessage: { message: '', stepReturn: 'A' },
    notResponseMessage: { time: 10, type: 1, destiny: '' },
    welcomeMessage: { message: '' },
    maxRetryBotMessage: { number: 3, type: 1, destiny: '' },
    ...props.node.configurations
  },
  interactions: [...(props.node.interactions || [])],
  conditions: [...(props.node.conditions || [])]
})

const addInteraction = () => {
  form.value.interactions.push({ message: '' })
}

const removeInteraction = (index) => {
  form.value.interactions.splice(index, 1)
}

const addCondition = () => {
  form.value.conditions.push({ label: '' })
}

const removeCondition = (index) => {
  form.value.conditions.splice(index, 1)
}

const handleSubmit = () => {
  emit('save', form.value)
}
</script>

<style lang="scss" scoped>
.node-form {
  padding: 16px;

  .section {
    margin: 16px 0;
  }

  .section-title {
    font-weight: 500;
    margin-bottom: 8px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
}
</style>
