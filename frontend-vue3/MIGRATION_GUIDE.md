# Guia de Migração Vue 2 para Vue 3

## 1. Atualização das Dependências Principais

```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.0.0",
    "vuex": "^4.0.0", 
    "quasar": "^2.0.0",
    "@quasar/extras": "^2.0.0",
    "vuelidate": "^2.0.0",
    "socket.io-client": "^3.1.3",
    "axios": "^1.4.0",
    "moment": "^2.29.4",
    "vue3-infinite-loading": "^1.0.1",
    "vue-apexcharts": "^3.0.0"
  },
  "devDependencies": {
    "@quasar/app-webpack": "^3.0.0",
    "@vue/compiler-sfc": "^3.3.0",
    "eslint-plugin-vue": "^9.0.0"
  }
}
```

## 2. Atualizações no quasar.conf.js

```javascript
module.exports = function (ctx) {
  return {
    framework: {
      // Atualizar configurações do Quasar
      plugins: ['Notify', 'Dialog', 'LocalStorage']
    },
    build: {
      // Atualizar configuração do webpack
      chainWebpack (chain) {
        chain.module.rule('vue')
          .use('vue-loader')
          .tap(options => ({
            ...options,
            compilerOptions: {
              isCustomElement: tag => tag.startsWith('ion-')
            }
          }))
      }
    }
  }
}
```

## 3. Mudanças nos Componentes

### Alterações necessárias:

1. Remover mixins e substituir por composables
2. Atualizar sintaxe de eventos (@click para @click.prevent)
3. Substituir filters por métodos ou computed properties
4. Atualizar refs (this.$refs para ref())
5. Substituir .sync por v-model
6. Atualizar slots nomeados

### Exemplo de componente antes:
```vue
<template>
  <div>
    <slot name="header"></slot>
  </div>
</template>

<script>
export default {
  name: 'MeuComponente',
  data() {
    return {
      contador: 0
    }
  }
}
</script>
```

### Exemplo de componente depois:
```vue
<template>
  <div>
    <slot name="header"></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const contador = ref(0)
</script>
```

## 4. Atualização dos Composables

1. Substituir `this` por refs e reactive
2. Usar `provide/inject` ao invés de `this.$root`
3. Implementar `defineExpose` para expor propriedades

## 5. Atualizações no Router

```javascript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // suas rotas aqui
  ]
})
```

## 6. Atualização do Store (Vuex -> Pinia)

1. Instalar Pinia
2. Converter stores do Vuex para Pinia
3. Atualizar referências do store nos componentes

## 7. Checklist de Migração

- [ ] Atualizar package.json
- [ ] Instalar novas dependências
- [ ] Atualizar configuração do Quasar
- [ ] Migrar componentes para Composition API
- [ ] Atualizar composables
- [ ] Migrar router
- [ ] Migrar store para Pinia
- [ ] Testar funcionalidades críticas
- [ ] Atualizar testes unitários
- [ ] Verificar compatibilidade de plugins

## 8. Possíveis Problemas

1. Incompatibilidade com plugins Vue 2
2. Mudanças na reatividade
3. Alterações no ciclo de vida dos componentes
4. Problemas com TypeScript (se utilizado)

## 9. Recursos Úteis

- [Guia de Migração Oficial Vue 3](https://v3-migration.vuejs.org/)
- [Documentação Quasar v2](https://quasar.dev/start/upgrade-guide)
- [Guia Pinia](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

## 10. Próximos Passos

1. Fazer backup do projeto
2. Criar branch específica para migração
3. Seguir processo gradual de migração
4. Testar exaustivamente cada mudança
5. Documentar problemas encontrados
6. Atualizar documentação do projeto 

## 11. Migração Mantendo Options API

### Principais Mudanças Necessárias:

1. Atualizar sintaxe de eventos e props
2. Remover filters (substituir por métodos)
3. Atualizar lifecycle hooks que foram removidos
4. Adaptar mixins se necessário
5. Atualizar plugins e dependências

### Exemplo de Migração do Chat.vue

#### Antes (Vue 2):
```vue
<script>
export default {
  name: 'Chat',
  filters: {
    formatDate(value) {
      return moment(value).format('DD/MM/YYYY')
    }
  },
  data() {
    return {
      messages: [],
      loading: false
    }
  },
  methods: {
    formatDate(value) {
      return moment(value).format('DD/MM/YYYY')
    }
  }
}
</script>
```

#### Depois (Vue 3 com Options API):
```vue
<script>
export default {
  name: 'Chat',
  // Remover filters e mover para methods
  data() {
    return {
      messages: [],
      loading: false
    }
  },
  methods: {
    formatDate(value) {
      return moment(value).format('DD/MM/YYYY')
    }
  }
}
</script>
```

### Mudanças nos Eventos:

#### Antes:
```vue
<template>
  <child-component @custom-event="handler"></child-component>
</template>
<script>
export default {
  methods: {
    handler(data) {
      console.log(data)
    }
  }
}
</script>
```

#### Depois:
```vue
<template>
  <child-component @custom-event="handler"></child-component>
</template>
<script>
export default {
  methods: {
    handler(data) {
      console.log(data)
    }
  },
  emits: ['custom-event'] // Novo em Vue 3: declarar eventos emitidos
}
</script>
```

### Principais Alterações:

1. Remover todos os filters (usar methods ou computed properties)
2. Declarar eventos emitidos usando a opção `emits`
3. Atualizar `.sync` para `v-model:propName`
4. Atualizar refs (ainda usa `this.$refs` mas com algumas mudanças na API)
5. Adaptar uso de slots nomeados se necessário

### Lifecycle Hooks Alterados:

- `beforeDestroy` -> `beforeUnmount`
- `destroyed` -> `unmounted`
- Os demais hooks permanecem os mesmos

### Exemplo de Props e v-model:

```vue
<script>
export default {
  props: {
    modelValue: String, // antes era 'value'
  },
  methods: {
    updateValue(newValue) {
      this.$emit('update:modelValue', newValue) // antes era 'input'
    }
  }
}
</script>
```

### Checklist de Migração (Options API):

- [ ] Atualizar package.json com novas dependências
- [ ] Remover todos os filters
- [ ] Declarar eventos emitidos com `emits`
- [ ] Atualizar nomes de lifecycle hooks
- [ ] Atualizar v-model e .sync
- [ ] Verificar compatibilidade de plugins
- [ ] Testar funcionalidades críticas

### Recursos Úteis para Options API:

- [Guia de Migração Vue 3 (Options API)](https://v3-migration.vuejs.org/breaking-changes/)
- [Options API no Vue 3](https://vuejs.org/guide/introduction.html#api-styles)
- [Documentação Quasar v2 com Options API](https://quasar.dev/start/vue-compatibility)

## 12. Arquivos do Projeto para Migração

### Arquivos Principais:

1. **Chat e Componentes Relacionados**:
```
frontend/src/pages/atendimento/Chat.vue
frontend/src/pages/atendimento/modals/ScheduleModal.vue
frontend/src/pages/atendimento/modals/ForwardModal.vue
frontend/src/pages/atendimento/components/ContactSelect.vue
```

2. **Composables**:
```
frontend/src/composables/useTicketStatus.js
frontend/src/composables/useScroll.js
frontend/src/composables/useMessages.js
frontend/src/composables/useContacts.js
frontend/src/composables/useTransfer.js
```

### Ordem de Migração Recomendada:

1. **Fase 1 - Composables**:
   - useTicketStatus.js
   - useContacts.js
   - useMessages.js
   - useScroll.js
   - useTransfer.js

2. **Fase 2 - Componentes Base**:
   - ContactSelect.vue

3. **Fase 3 - Modais**:
   - ScheduleModal.vue
   - ForwardModal.vue

4. **Fase 4 - Componente Principal**:
   - Chat.vue

### Processo de Migração por Tipo:

1. **Para Composables**:
   - Manter a estrutura atual
   - Atualizar imports do Vue
   - Verificar compatibilidade com Vue 3
   - Testar integração com componentes

2. **Para Modais**:
   - Atualizar lifecycle hooks
   - Declarar emits
   - Atualizar v-model
   - Verificar slots

3. **Para Componentes**:
   - Atualizar sintaxe de eventos
   - Remover filters
   - Atualizar refs
   - Verificar props

### Checklist por Arquivo:

#### Chat.vue:
- [ ] Atualizar lifecycle hooks
- [ ] Declarar emits
- [ ] Verificar refs
- [ ] Atualizar v-model
- [ ] Testar integração com composables

#### ScheduleModal.vue e ForwardModal.vue:
- [ ] Atualizar v-model
- [ ] Declarar emits
- [ ] Verificar slots
- [ ] Testar eventos

#### ContactSelect.vue:
- [ ] Atualizar props
- [ ] Verificar eventos
- [ ] Testar v-model
- [ ] Verificar slots

#### Composables:
- [ ] Verificar compatibilidade
- [ ] Atualizar imports
- [ ] Testar reatividade
- [ ] Verificar integração

### Notas Importantes:

1. **Backup**:
   - Criar branch específica: `feature/vue3-migration`
   - Fazer backup local dos arquivos

2. **Testes**:
   - Testar cada componente após migração
   - Verificar integração entre componentes
   - Testar fluxos completos

3. **Documentação**:
   - Documentar mudanças realizadas
   - Atualizar comentários no código
   - Registrar problemas encontrados

4. **Dependências**:
   - Verificar compatibilidade de plugins
   - Atualizar bibliotecas necessárias
   - Testar integrações externas

## 13. Detalhes Específicos da Migração

### Atualizações no Package.json

```json
{
  "dependencies": {
    // Dependências Core
    "vue": "^3.3.0",
    "quasar": "^2.12.0",
    "@quasar/extras": "^1.16.0",
    "vue-router": "^4.2.0",
    "vuex": "^4.1.0",
    
    // Socket.IO - manter compatibilidade com backend
    "socket.io-client": "^3.1.3", // Compatível com socket.io ^3.1.2 do backend
    
    // Outras dependências que precisam ser atualizadas
    "axios": "^1.4.0",
    "moment": "^2.29.4",
    "vuelidate": "^2.0.0",
    "vue3-infinite-loading": "^1.0.1",
    "vue-apexcharts": "^3.0.0"
  },
  "devDependencies": {
    "@quasar/app-webpack": "^3.9.0",
    "@babel/core": "^7.21.0",
    "eslint": "^8.40.0",
    "eslint-plugin-vue": "^9.11.0"
  }
}
```

### Configuração do Socket.IO no Vue 3

```javascript
// src/boot/socket.js
import { boot } from 'quasar/wrappers'
import io from 'socket.io-client'

export default boot(({ app }) => {
  const socket = io(process.env.VUE_URL_API, {
    transports: ['websocket'],
    upgrade: false
  })

  // Disponibilizar socket globalmente
  app.config.globalProperties.$socket = socket
})
```

### Notas Importantes sobre Socket.IO:

1. Manter versões compatíveis:
   - Backend: socket.io ^3.1.2
   - Frontend: socket.io-client ^3.1.3

2. Configuração do Socket.IO:
```javascript
// src/boot/socket.js
import { boot } from 'quasar/wrappers'
import io from 'socket.io-client'

export default boot(({ app }) => {
  const socket = io(process.env.VUE_URL_API, {
    transports: ['websocket'],
    upgrade: false
  })

  app.config.globalProperties.$socket = socket
})
```

3. Pontos de Atenção:
   - Testar conexão websocket após migração
   - Verificar eventos socket após migração
   - Manter compatibilidade entre versões frontend/backend
   - Não atualizar para versão 4.x sem atualizar ambos

### Mudanças Específicas nos Componentes

#### 1. Atualizações em Eventos:

```vue
<!-- Antes (Vue 2) -->
<template>
  <q-btn @click.native="handleClick">
  <component v-on:custom-event="handler">
</template>

<!-- Depois (Vue 3) -->
<template>
  <q-btn @click="handleClick">
  <component @custom-event="handler">
</template>
```

#### 2. Slots Nomeados:

```vue
<!-- Antes (Vue 2) -->
<template>
  <slot name="header" :data="data">
  <template slot="header" slot-scope="{ data }">
</template>

<!-- Depois (Vue 3) -->
<template>
  <slot name="header" :data="data">
  <template #header="{ data }">
</template>
```

#### 3. Múltiplos v-model:

```vue
<!-- Antes (Vue 2) -->
<ChildComponent
  v-model="title"
  :description.sync="description"
/>

<!-- Depois (Vue 3) -->
<ChildComponent
  v-model:title="title"
  v-model:description="description"
/>
```

### Atualizações em Composables

#### useTicketStatus.js:

```javascript
// Antes (Vue 2)
export default {
  data: () => ({
    status: null
  }),
  methods: {
    updateStatus() {}
  }
}

// Depois (Vue 3)
export default {
  data: () => ({
    status: null
  }),
  emits: ['status-updated'],
  methods: {
    updateStatus() {
      this.$emit('status-updated')
    }
  }
}
```

### Mudanças no Router

```javascript
// Antes (Vue 2)
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// Depois (Vue 3)
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...]
})
```

### Atualizações no Vuex Store

```javascript
// Antes (Vue 2)
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({})

// Depois (Vue 3)
import { createStore } from 'vuex'

export default createStore({})
```

### Problemas Comuns e Soluções

1. **Erro de Montagem de Componentes**:
   ```javascript
   // Antes
   mounted() {
     this.$nextTick(() => {})
   }
   
   // Depois
   mounted() {
     this.$nextTick(() => {})
     // ou
     await this.$nextTick()
   }
   ```

2. **Refs não Definidos**:
   ```javascript
   // Antes
   this.$refs.myRef.someMethod()
   
   // Depois
   if (this.$refs.myRef) {
     this.$refs.myRef.someMethod()
   }
   ```

3. **Eventos Globais**:
   ```javascript
   // Antes
   Vue.prototype.$eventBus = new Vue()
   
   // Depois
   import mitt from 'mitt'
   const emitter = mitt()
   app.config.globalProperties.$eventBus = emitter
   ```

### Atualizações nos Plugins Quasar

```javascript
// quasar.conf.js
return {
  framework: {
    plugins: [
      'Notify',
      'Dialog',
      'Loading'
    ],
    config: {
      notify: { /* ... */ },
      loading: { /* ... */ }
    }
  }
}
```

### Checklist de Verificação de Compatibilidade

#### Componentes:
- [ ] Verificar uso de `$listeners`
- [ ] Atualizar `.native` modifiers
- [ ] Verificar `$children`
- [ ] Atualizar `$scopedSlots`
- [ ] Verificar filtros globais

#### Plugins:
- [ ] Verificar plugins Vue 2 específicos
- [ ] Atualizar plugins Quasar
- [ ] Verificar compatibilidade de bibliotecas terceiras

#### Performance:
- [ ] Verificar computed properties
- [ ] Otimizar watchers
- [ ] Verificar renderizações desnecessárias

### Recursos Adicionais

1. **Ferramentas de Migração**:
   - [vue-migration-helper](https://github.com/vuejs/vue-migration-helper)
   - [gogocode-vue](https://github.com/thx/gogocode/tree/main/packages/gogocode-plugin-vue)

2. **Documentação Específica**:
   - [Breaking Changes do Vue 3](https://v3-migration.vuejs.org/breaking-changes/)
   - [Guia de Migração do Quasar](https://quasar.dev/start/upgrade-guide)

3. **Comunidade e Suporte**:
   - [Vue Forum](https://forum.vuejs.org/)
   - [Quasar Discord](https://discord.gg/5TDhbDg)

### Dicas de Depuração

1. **Vue Devtools**:
   - Instalar nova versão compatível com Vue 3
   - Verificar componentes renderizados
   - Monitorar eventos e props

2. **Console Warnings**:
   ```javascript
   app.config.warnHandler = function(msg, vm, trace) {
     console.warn(msg, trace)
   }
   ```

3. **Performance Monitoring**:
   ```javascript
   app.config.performance = true
   ```

### Migração do Infinite Loading

#### Instalação
```bash
npm remove vue-infinite-loading
npm install vue3-infinite-loading
```

#### Antes (Vue 2 com vue-infinite-loading):
```vue
<template>
  <div class="messages-container">
    <div v-for="message in messages" :key="message.id">
      {{ message.text }}
    </div>
    <infinite-loading @infinite="infiniteHandler"></infinite-loading>
  </div>
</template>

<script>
export default {
  methods: {
    async infiniteHandler($state) {
      try {
        const { data } = await this.fetchMessages()
        if (data.length) {
          this.messages = [...this.messages, ...data]
          $state.loaded()
        } else {
          $state.complete()
        }
      } catch (error) {
        $state.error()
      }
    }
  }
}
</script>
```

#### Depois (Vue 3 com vue3-infinite-loading):
```vue
<template>
  <div class="messages-container">
    <div v-for="message in messages" :key="message.id">
      {{ message.text }}
    </div>
    <infinite-loading
      :distance="10"
      target=".messages-container"
      :firstload="true"
      @infinite="infiniteHandler"
    >
      <template #loading>
        <div class="loading-spinner">Carregando...</div>
      </template>
      <template #complete>
        <div class="no-more">Não há mais mensagens</div>
      </template>
      <template #error>
        <div class="error">Erro ao carregar mensagens</div>
      </template>
    </infinite-loading>
  </div>
</template>

<script>
import { InfiniteLoading } from 'vue3-infinite-loading'

export default {
  components: {
    InfiniteLoading
  },
  methods: {
    async infiniteHandler($state) {
      try {
        const { data } = await this.fetchMessages()
        if (data.length) {
          this.messages = [...this.messages, ...data]
          $state.loaded()
        } else {
          $state.complete()
        }
      } catch (error) {
        $state.error()
      }
    }
  }
}
</script>
```

#### Principais Diferenças:

1. **Importação e Registro**:
   - Vue 3 requer importação explícita do componente
   - Necessário registrar o componente localmente

2. **Novas Props**:
   - `distance`: distância para trigger do carregamento
   - `target`: elemento alvo para scroll
   - `firstload`: controle do primeiro carregamento

3. **Slots Nomeados**:
   - `loading`: estado de carregamento
   - `complete`: quando não há mais dados
   - `error`: quando ocorre um erro

4. **Estilização**:
   ```css
   .loading-spinner {
     text-align: center;
     padding: 10px;
   }
   
   .no-more {
     text-align: center;
     color: #999;
     padding: 10px;
   }
   
   .error {
     text-align: center;
     color: #ff5252;
     padding: 10px;
   }
   ```

## 14. Compatibilidade de Dependências

### Dependências que Precisam ser Atualizadas:

```json
{
  "dependencies": {
    // Atualizações necessárias
    "vue-apexcharts": "^2.0.0" -> "^3.0.0",
    "vuedraggable": "^2.24.3" -> "^4.1.0",
    
    // Alternativas para Vue 3
    "v-emoji-picker": "vue3-emoji-picker",
    "vue-codemirror": "@codemirror/vue",
    "vue-easy-lightbox": "vue-easy-lightbox-next",
    "vue-linkify": "vue3-linkify"
  }
}
```

### Guia de Migração por Componente:

1. **ApexCharts**:
```javascript
// Antes
import VueApexCharts from 'vue-apexcharts'
Vue.use(VueApexCharts)

// Depois
import VueApexCharts from 'vue3-apexcharts'
app.use(VueApexCharts)
```

2. **Vuedraggable**:
```vue
<!-- Antes -->
import Draggable from 'vuedraggable'

<!-- Depois -->
import { VueDraggableNext } from 'vue-draggable-next'
```

3. **CodeMirror**:
```javascript
// Antes
import VueCodemirror from 'vue-codemirror'

// Depois
import { Codemirror } from 'vue-codemirror'
```

### Checklist de Compatibilidade:

- [ ] Atualizar vue-apexcharts para versão Vue 3
- [ ] Migrar vuedraggable para vue-draggable-next
- [ ] Substituir v-emoji-picker
- [ ] Atualizar vue-codemirror
- [ ] Verificar alternativas para vue-easy-lightbox
- [ ] Testar vue-linkify ou buscar alternativa

### Notas de Compatibilidade:

1. **Componentes Core**:
   - Vue 3.3.0 ✅
   - Vue Router 4.2.0 ✅
   - Vuex 4.1.0 ✅
   - Quasar 2.12.0 ✅

2. **Comunicação**:
   - Socket.io-client 3.1.3 ✅
   - Axios 1.4.0 ✅

3. **Utilitários**:
   - Moment 2.29.4 ✅
   - Lodash 4.17.21 ✅
   - Vuelidate 2.0.0 ✅