import Vue from 'vue'
import Vuex from 'vuex'
import attachCognitoModule from '@vuetify/vuex-cognito-module'

import App from '@/store/modules/App'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    App
  },
  // eslint-disable-next-line
  strict: process.env.NODE_ENV !== 'production'
})

attachCognitoModule(store, {
  userPoolId: process.env.VUE_APP_AWS_USER_POOL_ID,
  identityPoolId: process.env.VUE_APP_AWS_IDENTITY_POOL_ID,
  userPoolWebClientId: process.env.VUE_APP_AWS_WEB_CLIENT_ID,
  region: process.env.VUE_APP_AWS_REGION
}, 'Cognito')

export default store
