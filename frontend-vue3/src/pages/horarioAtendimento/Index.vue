<template>
  <div v-if="userProfile === 'admin'" class="horario-atendimento">
    <!-- Card de Horários -->
    <q-card class="q-ma-sm" square>
      <div class="text-h5 q-pa-sm q-ma-sm row items-center justify-between">
        <div class="row items-center">
          Horário de Atendimento
          <q-icon name="help" class="q-ml-sm">
            <q-tooltip class="bg-light-blue-1 text-black q-pa-sm shadow-4">
              <span class="text-weight-medium">Tipos de horário:</span>
              <div class="q-mt-sm">
                <div class="row q-mb-sm">
                  <b>Aberto:</b> Estabelecimento aberto durante todo o dia. Não será feito envio de mensagem de ausência.
                </div>
                <div class="row q-mb-sm">
                  <b>Fechado:</b> Estabelecimento fechado durante todo o dia. Será feito envio de mensagem de ausência, independente do horário.
                </div>
                <div class="row q-mb-sm">
                  <b>Horário:</b> Representa o horário de funcionamento do estabelecimento. O sistema enviará mensagem de ausência quando mensagens forem recebidas fora dos horários estabelecidos.
                </div>
                <div class="row text-italic">
                  **Importante: A mensagem de ausência será enviada após o encerramento do atendimento automático.
                </div>
              </div>
            </q-tooltip>
          </q-icon>
        </div>

        <q-btn
          rounded
          color="positive"
          icon="save"
          label="Salvar"
          @click="salvarHorariosAtendimento"
        />
      </div>

      <q-separator />

      <!-- Grid de Horários -->
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div
            v-for="dia in businessHours"
            :key="dia.value"
            class="col-xs-12 col-sm-4 q-mt-sm"
          >
            <q-card square bordered flat>
              <!-- Cabeçalho do Dia -->
              <div class="text-body1 text-bold bg-grey-3 q-pa-xs q-pl-sm">
                {{ dia.label }}
              </div>

              <q-separator />

              <!-- Conteúdo do Dia -->
              <q-card-section class="q-pt-none">
                <!-- Tipo de Horário -->
                <q-option-group
                  v-model="dia.type"
                  :options="optType"
                  color="primary"
                  inline
                  class="row justify-between q-mb-md"
                />

                <!-- Primeiro Horário -->
                <div class="row items-baseline q-gutter-sm">
                  <q-input
                    v-model="dia.hr1"
                    :disable="dia.type !== 'H'"
                    dense
                    rounded
                    outlined
                    class="col-grow"
                    type="time"
                    hide-bottom-space
                  />
                  <h6>às</h6>
                  <q-input
                    v-model="dia.hr2"
                    :disable="dia.type !== 'H'"
                    dense
                    rounded
                    outlined
                    class="col-grow"
                    type="time"
                    hide-bottom-space
                  />
                </div>

                <!-- Segundo Horário -->
                <div class="row items-baseline q-gutter-sm q-mt-sm">
                  <q-input
                    v-model="dia.hr3"
                    :disable="dia.type !== 'H'"
                    dense
                    rounded
                    outlined
                    class="col-grow"
                    type="time"
                    hide-bottom-space
                  />
                  <h6>às</h6>
                  <q-input
                    v-model="dia.hr4"
                    :disable="dia.type !== 'H'"
                    dense
                    rounded
                    outlined
                    class="col-grow"
                    type="time"
                    hide-bottom-space
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Card de Mensagem -->
    <q-card class="q-ma-sm q-mt-md">
      <div class="text-h6 q-pa-sm q-ma-sm row items-center justify-between">
        <div>Mensagem de Ausência</div>
        <q-btn
          rounded
          color="positive"
          icon="save"
          label="Salvar"
          @click="salvarMensagemAusencia"
        />
      </div>

      <q-card-section class="q-pt-none">
        <div class="row items-center">
          <!-- Botões de Inserção -->
          <div class="col-xs-3 col-sm-2 col-md-1">
            <!-- Emoji -->
            <q-btn round flat class="q-ml-sm">
              <q-icon size="2em" name="mdi-emoticon-happy-outline" />
              <q-tooltip>Emoji</q-tooltip>
              <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                <VEmojiPicker
                  style="width: 40vw"
                  :showSearch="false"
                  :emojisByRow="20"
                  labelSearch="Localizar..."
                  lang="pt-BR"
                  @select="onInsertSelectEmoji"
                />
              </q-menu>
            </q-btn>

            <!-- Variáveis -->
            <q-btn round flat dense>
              <q-icon size="2em" name="mdi-variable" />
              <q-tooltip>Variáveis</q-tooltip>
              <q-menu touch-position>
                <q-list dense style="min-width: 100px">
                  <q-item
                    v-for="variavel in variaveis"
                    :key="variavel.label"
                    clickable
                    @click="onInsertSelectVariable(variavel.value)"
                    v-close-popup
                  >
                    <q-item-section>{{ variavel.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <!-- Campo de Mensagem -->
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <textarea
              ref="inputEnvioMensagem"
              v-model="messageBusinessHours"
              class="message-input q-pa-sm bg-white rounded-borders full-width"
              placeholder="Digite a mensagem"
              autogrow
              dense
              outlined
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { VEmojiPicker } from 'v-emoji-picker'
import { useHorarioAtendimento } from '../../composables/horarioAtendimento/useHorarioAtendimento'

// Estado
const userProfile = ref(localStorage.getItem('profile'))

// Composables
const {
  messageBusinessHours,
  inputEnvioMensagem,
  businessHours,
  optType,
  variaveis,
  listarHorariosAtendimento,
  salvarHorariosAtendimento,
  salvarMensagemAusencia,
  onInsertSelectVariable,
  onInsertSelectEmoji
} = useHorarioAtendimento()

// Lifecycle
onMounted(() => {
  listarHorariosAtendimento()
})
</script>

<style lang="scss" scoped>
.horario-atendimento {
  // Cards
  .q-card {
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }

  // Inputs
  .q-input {
    transition: all 0.3s ease;

    &:hover:not(.q-field--disabled) {
      .q-field__control {
        border-color: var(--q-primary);
      }
    }
  }

  // Botões
  .q-btn {
    opacity: 0.9;
    transition: all 0.3s ease;

    &:hover {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  // Campo de mensagem
  .message-input {
    min-height: 9vh;
    max-height: 9vh;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    resize: none;

    &:hover, &:focus {
      border-color: var(--q-primary);
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .horario-atendimento {
    .q-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .message-input {
      border-color: rgba(255, 255, 255, 0.12);

      &:hover, &:focus {
        border-color: var(--q-primary);
      }
    }
  }
}
</style>
