import Vue from 'vue'
import store from '@/store'
import App from '@/components/App'
// import router from '@/router'
import '@/global'

new Vue({
  el: '#app',
  // router,
  store,
  template: '<App/>',
  components: { App }
})
