import Vue from 'vue'
import * as t from '@/store/types'
import { MIC } from '@/lib/MIC'
import { MQTT } from '@/lib/MQTT'
import {
  TOPIC,
  SENSORS
} from '@/config'

const state = {
  auth: false,
  sensors: {},
  names: {}
}

const mutations = {
  [t.APP_SET_AUTH] (state, value) {
    state.auth = value
  },
  [t.APP_SET_DATA] (state, {topic, message}) {
    try {
      const id = topic.slice(-8)
      let data = JSON.parse(message)

      // Cannot parse
      if (!data.state.reported.hasOwnProperty('payload'))
        return

      // Debug
      //data.state.reported.pm25 = 155
      //data.state.reported.pm10 = 85

      state.sensors[id] = data.state.reported
    } catch (e) {
      console.log(e)
      return
    }

    const copy = state.sensors
    state.sensors = Object.assign({}, copy)
  },
  [t.APP_SET_NAMES] (state, sensors) {
    try {
      state.names = sensors.map(sensor => {
        return { [sensor['_id']]: sensor['_source'].label }
      })
      .reduce((a, b) => {
        return Object.assign(a, b)
      }, {})
    } catch (e) {
      console.log(e)
      return
    }
  }
}

const actions = {
  auth ({commit, dispatch}, {username, password, ctx}) {
    return MIC.login(username, password)
      .then(account => {
        commit(t.APP_SET_AUTH, 1)
        dispatch('getNames')
        MQTT.init(ctx)
        return Promise.resolve(account)
      })
  },
  message ({commit, dispatch}, {topic, message}) {
    commit(t.APP_SET_DATA, {topic, message})

    // No payload. Probably a newly created thing
    // Refetch names.
    try {
      let data = JSON.parse(message)
      if (!data.state.reported.hasOwnProperty('payload'))
        dispatch('getNames')
    } catch (e) {
      return
    }
  },
  getNames ({commit, dispatch}) {
    MIC.invoke('ThingLambda', {
      action: 'FIND',
      query: {
        size: 50,
        query: { term: { thingType: '490' } }
      }
    })
    .then(r => { return r.hits.hits })
    .then(sensors => {
      commit(t.APP_SET_NAMES, sensors)
      dispatch('getTimeseries')
    })
    .catch(e => {
      console.log(e)
    })
  },
  getTimeseries ({commit}) {
    console.log('timeseries')
    MIC.invoke('ObservationLambda', {
      action: 'FIND',
      query: {
        size: 1,
        aggs: {
          hist: {
            date_histogram: {
              field: 'timestamp',
              interval: '1h',
              time_zone: '+01:00',
              min_doc_count: 1,
              extended_bounds: {
                min: '2018-01-29T23:00:00.000Z',
                max: '2018-02-06T12:33:53.881Z'
              }
            },
            aggs: {
              v10: { avg: { field: 'state.v10' } },
              v25: { avg: { field: 'state.v25' } }
            }
          }
        },
        query: {
          filtered: {
            filter: {
              bool: {
                must: [
                  { term: { thingName: '00001338' } },
                  { range: { timestamp: {
                    gte: '2018-01-29T23:00:00.000Z',
                    lte: + new Date()
                  } } }
                ],
                should: [
                  { exists: { field: 'state.v10' } },
                  { exists: { field: 'state.v25' } }
                ]
              }
            }
          }
        }
      }
    })
    .then(d => {
      console.log(d)
    })
    .catch(e => {
      console.log(e)
    })
  }
}

const getters = {
  auth: (state) => {
    return state.auth
  },
  sensors: (state) => {
    let tmp = state.sensors

    // Add names from map
    try {
      for (let key in tmp) {
        if (state.names.hasOwnProperty(key))
          tmp[key].name = state.names[key]
        else
          tmp[key].name = 'Unnamed'
      }
    } catch (e) {
      console.log(e)
    }

    return tmp
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
