<template>
  <div class="node-menu">
    <div class="menu-title">Componentes</div>
    
    <div class="menu-items">
      <div
        v-for="item in menuList"
        :key="item.type"
        class="menu-item"
        draggable
        @dragstart="handleDragStart($event, item)"
      >
        <q-icon :name="item.ico" size="20px" />
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const menuList = ref([
  {
    type: 'message',
    name: 'Mensagem',
    ico: 'mdi-message',
    interactions: [],
    conditions: []
  },
  {
    type: 'action',
    name: 'Ação',
    ico: 'mdi-play-circle',
    actions: []
  },
  {
    type: 'condition',
    name: 'Condição',
    ico: 'mdi-help-circle',
    conditions: []
  }
])

const handleDragStart = (event, item) => {
  event.dataTransfer.setData('nodeData', JSON.stringify({
    type: item.type,
    name: item.name,
    ico: item.ico,
    interactions: item.interactions || [],
    conditions: item.conditions || [],
    actions: item.actions || []
  }))
}
</script>

<style lang="scss" scoped>
.node-menu {
  width: 250px;
  padding: 16px;
  border-right: 1px solid #ddd;

  .menu-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
  }

  .menu-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #fff;
    border: 1px dashed #ddd;
    border-radius: 4px;
    cursor: move;
    transition: all 0.2s;

    &:hover {
      border-color: #1976d2;
      background: #f5f5f5;
    }

    i {
      color: #666;
    }

    span {
      font-size: 14px;
    }
  }
}
</style>
