<template>
  <q-dialog
    @show="fetchContact"
    @hide="$emit('update:modalContato', false)"
    :value="modalContato"
    persistent
  >
    <q-card
      class="q-pa-lg"
      style="min-width: 700px"
    >
      <q-card-section>
        <div class="text-h6">
          {{ contactId ? 'Editar Contato' : 'Adicionar Contato'  }}
        </div>
      </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md text-bold">
        Dados Contato
      </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md row q-col-gutter-md">
        <c-input
          class="col-12"
          outlined
          v-model="contato.name"
          :validator="v$.contato.name"
          @blur="v$.contato.name.$touch"
          label="Nome"
        />
        <c-input
          class="col-12"
          outlined
          v-model="contato.number"
          :validator="v$.contato.number"
          @blur="v$.contato.number.$touch"
          mask="+#############"
          placeholder="+DDI DDD 99999 9999"
          fill-mask
          unmasked-value
          hint="Informe número com DDI e DDD"
          label="Número"
        />
        <c-input
          class="col-12"
          outlined
          dense
          rounded
          :validator="v$.contato.email"
          @blur="v$.contato.email.$touch"
          v-model="contato.email"
          label="E-mail"
        />
      </q-card-section>
      <q-card
        class="bg-white q-mt-sm btn-rounded"
        style="width: 100%"
        bordered
        flat
      >
        <q-card-section class="text-bold q-pb-none">
          Carteira
          <q-separator />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-select
            square
            borderless
            v-model="contato.wallets"
            multiple
            :max-values="1"
            :options="usuarios"
            use-chips
            option-value="id"
            option-label="name"
            emit-value
            map-options
            dropdown-icon="add"
          >
            <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
              <q-item
                v-bind="itemProps"
                v-on="itemEvents"
              >
                <q-item-section>
                  <q-item-label>{{ opt.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox
                    :value="selected"
                    @input="toggleOption(opt)"
                  />
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="{ opt }">
              <q-chip
                dense
                square
                color="white"
                text-color="primary"
                class="q-ma-xs row col-12 text-body1"
              >
                {{ opt.name }}
              </q-chip>
            </template>
            <template v-slot:no-option="{ itemProps, itemEvents }">
              <q-item
                v-bind="itemProps"
                v-on="itemEvents"
              >
                <q-item-section>
                  <q-item-label class="text-negative text-bold">
                    Ops... Sem carteiras disponíveis!!
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
      </q-card>
      <q-card-section class="q-pa-sm q-pl-md text-bold">
        Informações adicionais
      </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md row q-col-gutter-md justify-center">
        <template
          v-for="(extraInfo, index) in contato.extraInfo"
          :key="index"
        >
          <div class="col-12 row justify-center q-col-gutter-sm">
            <q-input
              class="col-6"
              outlined
              dense
              rounded
              v-model="extraInfo.name"
              label="Descrição"
            />
            <q-input
              class="col-5"
              outlined
              dense
              rounded
              label="Informação"
              v-model="extraInfo.value"
            />
            <div class="col q-pt-md">
              <q-btn
                icon="delete"
                round
                flat
                color="negative"
                @click="removeExtraInfo(index)"
              />
            </div>
          </div>
        </template>
        <div class="col-6">
          <q-btn
            class="full-width"
            color="primary"
            outline
            rounded
            label="Adicionar Informação"
            @click="contato.extraInfo.push({name: null, value: null})"
          />
        </div>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-lg"
      >
        <q-btn
          rounded
          label="Sair"
          color="negative"
          v-close-popup
          class="q-px-md "
        />
        <q-btn
          class="q-ml-lg q-px-md"
          rounded
          label="Salvar"
          color="positive"
          @click="saveContact"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, maxLength } from '@vuelidate/validators'
import { useQuasar } from 'quasar'
import { ObterContato, CriarContato, EditarContato } from 'src/service/contatos'
import { ListarUsuarios } from 'src/service/user'

const props = defineProps({
  modalContato: {
    type: Boolean,
    default: false
  },
  contactId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits([
  'update:modalContato',
  'contato-modal-editado',
  'contato-modal-criado'
])

const $q = useQuasar()

const usuarios = ref([])
const contato = reactive({
  name: null,
  number: null,
  email: '',
  extraInfo: [],
  wallets: []
})

const rules = {
  contato: {
    name: { required, minLength: minLength(3), maxLength: maxLength(50) },
    email: { email },
    number: { required, minLength: minLength(8) }
  }
}

const v$ = useVuelidate(rules, { contato })

const fetchContact = async () => {
  try {
    await listarUsuarios()
    if (!props.contactId) return
    const { data } = await ObterContato(props.contactId)
    Object.assign(contato, data)
    if (data.number.substring(0, 2) === '55') {
      contato.number = data.number.substring(0)
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Ocorreu um erro!',
      caption: error.message
    })
  }
}

const removeExtraInfo = index => {
  contato.extraInfo.splice(index, 1)
}

const saveContact = async () => {
  v$.value.$touch()
  if (v$.value.$error) {
    $q.notify({
      type: 'warning',
      progress: true,
      position: 'top',
      message: 'Ops! Verifique os erros...',
      actions: [{ icon: 'close', round: true, color: 'white' }]
    })
    return
  }

  const contatoData = {
    ...contato,
    number: String(contato.number)
  }

  try {
    if (props.contactId) {
      const { data } = await EditarContato(props.contactId, contatoData)
      emit('contato-modal-editado', data)
      $q.notify({
        type: 'info',
        progress: true,
        position: 'top',
        textColor: 'black',
        message: 'Contato editado!',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } else {
      const { data } = await CriarContato(contatoData)
      $q.notify({
        type: 'positive',
        progress: true,
        position: 'top',
        message: 'Contato criado!',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
      emit('contato-modal-criado', data)
    }
    emit('update:modalContato', false)
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Ocorreu um erro ao criar o contato',
      caption: error.message
    })
  }
}

const listarUsuarios = async () => {
  try {
    const { data } = await ListarUsuarios()
    usuarios.value = data.users
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Problema ao carregar usuários',
      caption: error.message
    })
  }
}

onBeforeUnmount(() => {
  v$.value.$reset()
})
</script>

<style lang="scss" scoped>
</style>
