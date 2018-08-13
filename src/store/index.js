import Vue from 'vue'
import Vuex from 'vuex'

import App from '@/store/modules/App'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    App
  },
  // eslint-disable-next-line
  strict: process.env.NODE_ENV !== 'production'
})
