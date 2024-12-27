import { defineStore } from 'pinia'

export const useChatFlowStore = defineStore('chatFlow', {
  state: () => ({
    flow: {},
    usuarios: [],
    filas: []
  }),

  actions: {
    setFlowData(payload) {
      this.flow = payload.flow
      this.usuarios = payload.usuarios
      this.filas = payload.filas
    },

    resetFlowData() {
      this.flow = {}
      this.usuarios = []
      this.filas = []
    }
  },

  getters: {
    getFlow: (state) => state.flow,
    getUsuarios: (state) => state.usuarios,
    getFilas: (state) => state.filas
  }
})
