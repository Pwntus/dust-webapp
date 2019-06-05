/* eslint-disable */

import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from '@/components/Dashboard'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/dust',
  routes: [
    {
      path: '/debug',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify({
          cards: [{
            name: 'dust-card',
            thingId: '00001337'
          }],
          rows: 1
        })
      }
    },
    {
      path: '/bruveien9',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify({
          cards: [{
            name: 'bus-card',
            title: 'Bruveien 9 (mot sentrum)',
            from: '19021626,19021601:1'
          }],
          rows: 1
        })
      }
    },
    {
      path: '/sentrum-mot-uit',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify({
          cards: [{
            name: 'bus-card',
            title: "Sentrum (mot UiT)",
            from: '19021022:1'
          }],
          rows: 1
        })
      }
    },
    {
      path: '/uit-north',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify({
          cards: [{
            name: 'bus-card',
            title: 'UiT (Northbound)',
            from: '19021323:1'
          }],
          rows: 1
        })
      }
    },
    {
      path: '/uit-south',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify({
          cards: [{
            name: 'bus-card',
            title: 'UiT (Southbound)',
            from: '19021323:2'
          }],
          rows: 1
        })
      }
    },
    {
      path: '/td',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify({
          cards: [{
            name: 'td-card'
          }],
          rows: 1
        })
      }
    },
    {
      path: '/dust',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify({
          cards: [
            {
              name: 'dust-card',
              thingId: '00001337'
            },
            {
              name: 'dust-card',
              thingId: '00001341'
            }
          ],
          rows: 1
        })
      }
    },

    // Default
    {
      path: '',
      component: Dashboard,
      props: {
        queryProp: JSON.stringify({
          cards: [
            // {
            //   name: 'dust-card',
            //   thingId: '00001337'
            // },
            // {
            //   name: 'dust-card',
            //   thingId: '00001341'
            // },
            {
              name: 'airport-card',
              title: 'Tromsø Airport, Langnes',
              center: '69.67,18.95',
              zoom: 7
            },
            {
              name: 'bus-card',
              title: 'UiT (Southbound)',
              from: '19021323:2'
            },
            {
              name: 'bus-card',
              title: 'UiT (Northbound)',
              from: '19021323:1'
            },
            {
              name: 'td-card'
            }
          ],
          rows: 2
        })
      }
    },

    // Custom query
    {
      path: '/:query?',
      component: Dashboard,
      name: 'dashboard'
    }
  ]
})