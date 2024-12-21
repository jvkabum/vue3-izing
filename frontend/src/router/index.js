import { createRouter, createWebHashHistory } from 'vue-router'
import { Notify } from 'quasar'
import routes from './routes'

const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: createWebHashHistory(process.env.VUE_ROUTER_BASE)
})

const whiteListName = [
  'login'
]

router.beforeEach((to, from, next) => {
  const token = JSON.parse(localStorage.getItem('token'))

  if (!token) {
    if (whiteListName.indexOf(to.name) === -1) {
      if (to.fullPath !== '/login' && !to.query.tokenSetup) {
        Notify.create({ 
          message: 'Necessário realizar login', 
          position: 'top' 
        })
        next({ name: 'login' })
      } else {
        next()
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

router.afterEach(() => {
  window.scrollTo(0, 0)
})

export default router
