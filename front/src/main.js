import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import cookies from 'vue-cookies'
import config from '../config'

import moment from 'moment'
moment.locale('zh-cn')

Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.prototype.$moment = moment

axios.defaults.baseURL = config.baseUrl

Vue.use(ElementUI)
Vue.use(cookies)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
