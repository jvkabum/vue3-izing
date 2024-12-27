<template>
  <div 
    :id="node.id"
    :class="['node-item', node.type]"
    :style="nodeStyle"
  >
    <div class="node-title">
      <q-icon :name="node.ico || 'mdi-message'" size="20px" />
      <span>{{ node.name }}</span>
      
      <div class="node-actions" v-if="!node.viewOnly">
        <q-btn
          flat
          round
          dense
          icon="delete"
          @click="$emit('delete', node)"
        />
      </div>
    </div>

    <div class="node-content">
      <div v-if="node.type === 'configurations'">
        <div class="config-item">
          <div class="config-label">Mensagem sem opção:</div>
          <div class="config-value">{{ node.configurations.notOptionsSelectMessage?.message }}</div>
        </div>
        
        <div class="config-item">
          <div class="config-label">Tempo sem resposta:</div>
          <div class="config-value">{{ node.configurations.notResponseMessage?.time }} min</div>
        </div>
        
        <div class="config-item">
          <div class="config-label">Mensagem de boas vindas:</div>
          <div class="config-value">{{ node.configurations.welcomeMessage?.message }}</div>
        </div>
      </div>

      <template v-else>
        <div v-if="node.interactions?.length" class="interactions">
          <div v-for="(interaction, idx) in node.interactions" :key="idx">
            {{ interaction.message }}
          </div>
        </div>

        <div v-if="node.conditions?.length" class="conditions">
          <div v-for="(condition, idx) in node.conditions" :key="idx">
            {{ condition.label }}
          </div>
        </div>

        <div v-if="node.actions?.length" class="actions">
          <div v-for="(action, idx) in node.actions" :key="idx">
            {{ action.type }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete'])

const nodeStyle = computed(() => ({
  left: props.node.left || '100px',
  top: props.node.top || '100px',
  ...props.node.style
}))
</script>

<style lang="scss" scoped>
.node-item {
  position: absolute;
  width: 200px;
  min-height: 65px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  cursor: move;

  &.start {
    background: #e8f5e9;
  }

  &.configurations {
    background: #e3f2fd;
  }
}

.node-title {
  display: flex;
  align-items: center;
  padding: 8px;
  background: rgba(0,0,0,0.03);
  border-bottom: 1px solid #eee;

  i {
    margin-right: 8px;
  }

  span {
    flex: 1;
    font-size: 14px;
  }
}

.node-content {
  padding: 8px;
  font-size: 12px;

  .config-item {
    margin-bottom: 8px;

    .config-label {
      color: #666;
      margin-bottom: 2px;
    }

    .config-value {
      color: #333;
      word-break: break-word;
    }
  }

  .interactions, .conditions, .actions {
    margin-bottom: 8px;
    padding: 4px;
    background: rgba(0,0,0,0.02);
    border-radius: 2px;
  }
}

.node-actions {
  display: flex;
  gap: 4px;
}
</style>
