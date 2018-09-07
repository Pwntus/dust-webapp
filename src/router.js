/* eslint-disable */

import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from '@/components/Dashboard'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/dust',
  routes: [{
      path: '/bruveien9',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify([{
          name: 'bus-card',
          title: 'Bruveien 9 (mot sentrum)',
          from: '19021626,19021601:1'
        }])
      }
    },
    {
      path: '/sentrum-mot-uit',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify([{
          name: 'bus-card',
          title: "Sentrum (mot UiT)",
          from: '19021022:1'
        }])
      }
    },
    {
      path: '/uit-north',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify([{
          name: 'bus-card',
          title: 'UiT (Northbound)',
          from: '19021323:1'
        }])
      }
    },
    {
      path: '/uit-south',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify([{
          name: 'bus-card',
          title: 'UiT (Southbound)',
          from: '19021323:2'
        }])
      }
    },
    {
      path: '/td',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify([{
          name: 'td-card'
        }])
      }
    },
    {
      path: '/:query?',
      component: Dashboard,
      name: 'dashboard'
    }
  ]
})