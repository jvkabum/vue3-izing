import { defineStore } from 'pinia'
import { ConsultarDadosTicket, LocalizarMensagens } from '../service/tickets'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'
import { orderMessages, orderTickets, checkTicketFilter } from '../utils/ticketHelpers'

export const useAtendimentoTicketStore = defineStore('atendimentoTicket', {
  state: () => ({
    chatTicketDisponivel: false,
    tickets: [],
    ticketsLocalizadosBusca: [],
    ticketFocado: {
      contacts: {
        tags: [],
        wallets: [],
        extraInfo: []
      }
    },
    hasMore: false,
    contatos: [],
    mensagens: []
  }),

  actions: {
    setHasMore(value) {
      this.hasMore = value
    },

    loadTickets(payload) {
      const newTickets = orderTickets(payload)
      newTickets.forEach(ticket => {
        const ticketIndex = this.tickets.findIndex(t => t.id === ticket.id)
        if (ticketIndex !== -1) {
          this.tickets[ticketIndex] = ticket
          if (ticket.unreadMessages > 0) {
            this.tickets.unshift(this.tickets.splice(ticketIndex, 1)[0])
          }
        } else {
          if (checkTicketFilter(ticket)) {
            this.tickets.push(ticket)
          }
        }
      })
    },

    resetTickets() {
      this.hasMore = true
      this.tickets = []
    },

    resetUnread(payload) {
      const ticketId = payload.ticketId
      const ticketIndex = this.tickets.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        this.tickets[ticketIndex] = {
          ...payload,
          unreadMessages: 0
        }
      }
    },

    updateTicket(payload) {
      const ticketIndex = this.tickets.findIndex(t => t.id === payload.id)
      if (ticketIndex !== -1) {
        const tickets = [...this.tickets]
        tickets[ticketIndex] = {
          ...tickets[ticketIndex],
          ...payload,
          username: payload?.user?.name || payload?.username || tickets[ticketIndex].username,
          profilePicUrl: payload?.contact?.profilePicUrl || payload?.profilePicUrl || tickets[ticketIndex].profilePicUrl,
          name: payload?.contact?.name || payload?.name || tickets[ticketIndex].name
        }
        this.tickets = tickets.filter(t => checkTicketFilter(t))

        if (this.ticketFocado.id == payload.id) {
          this.ticketFocado = {
            ...this.ticketFocado,
            ...payload
          }
        }
      } else {
        const tickets = [...this.tickets]
        tickets.unshift({
          ...payload,
          username: payload?.user?.name || payload?.username,
          profilePicUrl: payload?.contact?.profilePicUrl || payload?.profilePicUrl,
          name: payload?.contact?.name || payload?.name
        })
        this.tickets = tickets.filter(t => checkTicketFilter(t))
      }
    },

    deleteTicket(ticketId) {
      const ticketIndex = this.tickets.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        this.tickets.splice(ticketIndex, 1)
      }
    },

    updateTicketFocadoContact(payload) {
      this.ticketFocado.contact = payload
    },

    updateContact(payload) {
      if (this.ticketFocado.contactId == payload.id) {
        this.ticketFocado.contact = payload
      }
      const ticketIndex = this.tickets.findIndex(t => t.contactId === payload.id)
      if (ticketIndex !== -1) {
        const tickets = [...this.tickets]
        tickets[ticketIndex].contact = payload
        tickets[ticketIndex].name = payload.name
        tickets[ticketIndex].profilePicUrl = payload.profilePicUrl
        this.tickets = tickets
      }
    },

    setTicketFocado(payload) {
      this.ticketFocado = {
        ...payload,
        status: payload.status == 'pending' ? 'open' : payload.status
      }
    },

    loadInitialMessages(payload) {
      const { messages, messagesOffLine } = payload
      this.mensagens = []
      const newMessages = orderMessages([...messages, ...messagesOffLine])
      this.mensagens = newMessages
    },

    loadMoreMessages(payload) {
      const { messages, messagesOffLine } = payload
      const arrayMessages = [...messages, ...messagesOffLine]
      const newMessages = []
      arrayMessages.forEach((message, index) => {
        const messageIndex = this.mensagens.findIndex(m => m.id === message.id)
        if (messageIndex !== -1) {
          this.mensagens[messageIndex] = message
          arrayMessages.splice(index, 1)
        } else {
          newMessages.push(message)
        }
      })
      const messagesOrdered = orderMessages(newMessages)
      this.mensagens = [...messagesOrdered, ...this.mensagens]
    },

    updateMessages(payload) {
      if (this.ticketFocado.id === payload.ticket.id) {
        const messageIndex = this.mensagens.findIndex(m => m.id === payload.id)
        const mensagens = [...this.mensagens]
        if (messageIndex !== -1) {
          mensagens[messageIndex] = payload
        } else {
          mensagens.push(payload)
        }
        this.mensagens = mensagens
        if (payload.scheduleDate && payload.status == 'pending') {
          const idxScheduledMessages = this.ticketFocado.scheduledMessages.findIndex(m => m.id === payload.id)
          if (idxScheduledMessages === -1) {
            this.ticketFocado.scheduledMessages.push(payload)
          }
        }
      }

      const TicketIndexUpdate = this.tickets.findIndex(t => t.id == payload.ticket.id)
      if (TicketIndexUpdate !== -1) {
        const tickets = [...this.tickets]
        const unreadMessages = this.ticketFocado.id == payload.ticket.id ? 0 : payload.ticket.unreadMessages
        tickets[TicketIndexUpdate] = {
          ...this.tickets[TicketIndexUpdate],
          answered: payload.ticket.answered,
          unreadMessages,
          lastMessage: payload.mediaName || payload.body
        }
        this.tickets = tickets
      }
    },

    updateMessageStatus(payload) {
      if (this.ticketFocado.id != payload.ticket.id) return

      const messageIndex = this.mensagens.findIndex(m => m.id === payload.id)
      if (messageIndex !== -1) {
        this.mensagens[messageIndex] = payload
      }

      if (this.ticketFocado?.scheduledMessages) {
        this.ticketFocado.scheduledMessages = this.ticketFocado.scheduledMessages.filter(m => m.id != payload.id)
      }
    },

    updateMessage(payload) {
      if (this.ticketFocado.id != payload.ticketId) return

      this.mensagens = this.mensagens.map((m) => {
        if (m.id == payload.id) {
          return { ...m, ...payload }
        }
        return m
      })

      if (this.ticketFocado?.scheduledMessages) {
        this.ticketFocado.scheduledMessages = this.ticketFocado.scheduledMessages.map((m) => {
          if (m.id == payload.id) {
            return { ...m, ...payload }
          }
          return m
        })
      }
    },

    resetMessage() {
      this.mensagens = []
    },

    async localizarMensagensTicket(params) {
      const mensagens = await LocalizarMensagens(params)
      this.setHasMore(mensagens.data.hasMore)
      if (params.pageNumber === 1) {
        this.loadInitialMessages(mensagens.data)
      } else {
        this.loadMoreMessages(mensagens.data)
      }
    },

    async abrirChatMensagens(data) {
      const router = useRouter()
      try {
        this.setTicketFocado({})
        this.resetMessage()
        const ticket = await ConsultarDadosTicket(data)
        this.setTicketFocado(ticket.data)
        
        const params = {
          ticketId: data.id,
          pageNumber: 1
        }
        await this.localizarMensagensTicket(params)

        await router.push({ 
          name: 'chat', 
          params, 
          query: { t: new Date().getTime() } 
        })
      } catch (error) {
        if (!error) return
        const errorMsg = error?.response?.data?.error
        if (errorMsg) {
          Notify.create({
            type: 'negative',
            message: error.response.data.error,
            progress: true,
            position: 'top'
          })
        } else {
          Notify.create({
            type: 'negative',
            message: `Ops... Ocorreu um problema não identificado. ${JSON.stringify(error)}`,
            progress: true,
            position: 'top'
          })
        }
      }
    }
  },

  getters: {
    getTickets: (state) => state.tickets,
    getTicketFocado: (state) => state.ticketFocado,
    getMensagens: (state) => state.mensagens,
    getHasMore: (state) => state.hasMore
  }
})
