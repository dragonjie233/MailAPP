import Vue from 'vue'
import VueRouter from 'vue-router'
import VueCookies from 'vue-cookies'
import HomeView from '@/views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/detail',
    name: 'detail',
    component: () => import('@/views/DetailView.vue')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const token = VueCookies.get('token')
  const isDetailPageButNotToken = to.path != '/detail' || !to.query.t
  const noTokenAndNotInLoginPage = !token && to.path != "/login"
  const haveTokenInLoginPageAndGoHomePage = token && to.name == 'login' && from.name == null

  if (isDetailPageButNotToken) {
    if (noTokenAndNotInLoginPage) {
      next('/login')
    }
  
    if (haveTokenInLoginPageAndGoHomePage) {
      next('/')
    }
  }

  next()
})

export default router
