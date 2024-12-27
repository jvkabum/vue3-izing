import { defineStore } from 'pinia'
import { RealizarLogin } from '../service/login'
import { Notify, Dark } from 'quasar'
import { socketIO } from '../utils/socket'
import { useRouter } from 'vue-router'
import type { UserState, UserCredentials, UserData, UserConfig } from '../types/stores/user.types'

const socket = socketIO()

const pesquisaTicketsFiltroPadrao: UserConfig['filtrosAtendimento'] = {
  searchParam: '',
  pageNumber: 1,
  status: ['open', 'pending', 'closed'],
  showAll: false,
  count: null,
  queuesIds: [],
  withUnreadMessages: false,
  isNotAssignedUser: false,
  includeNotQueueDefined: true
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: null,
    isAdmin: false,
    isSuporte: false
  }),

  actions: {
    setIsSuporte(payload: UserData): void {
      const domains = ['@']
      let authorized = false
      domains.forEach(domain => {
        if (payload?.email.toLowerCase().indexOf(domain.toLowerCase()) !== -1) {
          authorized = true
        }
      })
      this.isSuporte = authorized
    },

    setIsAdmin(payload: UserData): void {
      this.isAdmin = !!(this.isSuporte || payload.profile === 'admin')
    },

    async userLogin(user: UserCredentials): Promise<void> {
      const router = useRouter()
      user.email = user.email.trim()
      try {
        const { data } = await RealizarLogin(user)
        localStorage.setItem('token', JSON.stringify(data.token))
        localStorage.setItem('username', data.username)
        localStorage.setItem('profile', data.profile)
        localStorage.setItem('userId', data.userId)
        localStorage.setItem('usuario', JSON.stringify(data))
        localStorage.setItem('queues', JSON.stringify(data.queues))
        localStorage.setItem('filtrosAtendimento', JSON.stringify(pesquisaTicketsFiltroPadrao))

        if (data?.configs?.filtrosAtendimento) {
          localStorage.setItem('filtrosAtendimento', JSON.stringify(data.configs.filtrosAtendimento))
        }
        if (data?.configs?.isDark) {
          Dark.set(data.configs.isDark)
        }

        this.setIsSuporte(data)
        this.setIsAdmin(data)

        socket.emit(`${data.tenantId}:setUserActive`)

        Notify.create({
          type: 'positive',
          message: 'Login realizado com sucesso!',
          position: 'top',
          progress: true
        })

        if (data.profile === 'admin') {
          router.push({ name: 'home-dashboard' })
        } else if (data.profile === 'super') {
          router.push({ name: 'empresassuper' })
        } else {
          router.push({ name: 'atendimento' })
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
})
