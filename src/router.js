/* eslint-disable */

import Vue        from 'vue'
import Router     from 'vue-router'
import Dashboard  from '@/components/Dashboard'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/dust',
  routes: [
    { path: '/bruveien9', component: Dashboard, props: { queryProp: '[{"name":"bus-card","title":"Bruveien 9 (mot sentrum)","from":"19021626,19021601:1"}]' } },
    { path: '/td', component: Dashboard, props: { queryProp: '[{"name":"td-card"}]' } },
    { path: '/:query?', component: Dashboard, name: 'dashboard' }
  ]
})
