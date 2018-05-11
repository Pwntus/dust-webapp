import Vue from 'vue'
import SWorker from 'simple-web-worker'
import * as t from '@/store/types'
import { MIC } from '@/lib/MIC'
import { MQTT } from '@/lib/MQTT'
import {
  TOPIC,
  THING_TYPE,
  SENSORS
} from '@/config'

let worker = SWorker.create([{
  message: 'set_histogram',
  func: buckets => {
    let tmp = null

    try {
      tmp = buckets.map(bucket => {
        return {
          date: bucket.key,
          pm25: (bucket.v25.value == null) ? 0 : bucket.v25.value,
          pm10: (bucket.v10.value == null) ? 0 : bucket.v10.value,
          tmp:  (bucket.tmp.value == null) ? 0 : bucket.tmp.value,
          hum:  (bucket.hum.value == null) ? 0 : bucket.hum.value
        }
      })
      .reduce((a, b) => {
        a.date.push(b.date)
        a.pm25.push(b.pm25)
        a.pm10.push(b.pm10)
        a.tmp.push(b.tmp)
        a.hum.push(b.hum)
        return a
      }, {
        date: [],
        pm25: [],
        pm10: [],
        tmp:  [],
        hum:  []
      })

      // We have data
      if (tmp.date.length > 0) {

        let x = []
        let latest = tmp.date[tmp.date.length - 1]
        for (let i = 0; i < 48; i++) {
          x.unshift(latest)
          latest -= 15 * 60 * 1000
        }

        let final = {
          date: x,
          pm25: [],
          pm10: [],
          tmp:  [],
          hum:  []
        }
        let ocount = 0
        for (let i = 0; i < x.length; i++) {

          if (!tmp.date.includes(x[i])) {
            final.pm25.push(0.1)
            final.pm10.push(0.1)
            final.tmp.push(0.1)
            final.hum.push(0.1)
          } else {
            final.pm25.push(tmp.pm25[ocount])
            final.pm10.push(tmp.pm10[ocount])
            final.tmp.push(tmp.tmp[ocount])
            final.hum.push(tmp.hum[ocount])
            ocount++
          }
        }

        tmp = final
      }

      return tmp

    } catch (e) {
      console.log(e)
    }
  }
}])

const state = {
  auth: false,
  sensors: {},
  names: {},
  histograms: {},
  queue: []
}

const mutations = {
  [t.APP_SET_AUTH] (state, value) {
    state.auth = value
  },
  [t.APP_SET_DATA] (state, {topic, data}) {
    try {
      const id = topic.slice(-8)

      // Debug
      //data.state.reported.pm25 = 155
      //data.state.reported.pm10 = 85

      state.sensors[id] = data.state.reported

      // Add latest to graph
      //let histogram = state.histograms[id]
      //histogram.date[histogram.date.length - 1] = + new Date()
      //histogram.pm25[histogram.pm25.length - 1] = data.state.reported.v25
      //histogram.pm10[histogram.pm10.length - 1] = data.state.reported.v10
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
    }
  },
  [t.APP_SET_HISTOGRAM] (state, {thingName, res}) {
    // Copy for reactivity
    let copy = Object.assign({}, state.histograms)
    copy[thingName] = res
    state.histograms = copy
  }
}

const actions = {
  auth ({commit, dispatch}, {username, password, ctx}) {
    return MIC.login(username, password)
      .then(account => {
        commit(t.APP_SET_AUTH, 1)
        MQTT.init(ctx)
        dispatch('getNames')
        return Promise.resolve(account)
      })
  },
  message ({commit, dispatch}, {topic, message}) {
    try {
      let data = JSON.parse(message)

      // No payload. Probably a newly created thing
      // Refetch names.
      if (!data.state.reported.hasOwnProperty('payload')) {
        dispatch('getNames')
        return
      }

      commit(t.APP_SET_DATA, {topic, data})

    } catch (e) {
      return
    }
  },
  getNames ({commit, dispatch}) {
    MIC.invoke('ThingLambda', {
      action: 'FIND',
      query: {
        size: 50,
        query: { term: { thingType: THING_TYPE } }
      }
    })
    .then(r => { return r.hits.hits })
    .then(sensors => {
      commit(t.APP_SET_NAMES, sensors)
    })
    .catch(e => {
      console.log(e)
    })
  },
  getHistogram ({commit}, thingName) {
    return MIC.invoke('ObservationLambda', {
      action: 'FIND',
      query: {
        size: 1,
        aggs: {
          hist: {
            date_histogram: {
              field: 'timestamp',
              interval: '15m',
              time_zone: '+01:00',
              min_doc_count: 1,
              extended_bounds: {}
            },
            aggs: {
              v10: { avg: { field: 'state.v10' } },
              v25: { avg: { field: 'state.v25' } },
              tmp: { avg: { field: 'state.tmp' } },
              hum: { avg: { field: 'state.hum' } }
            }
          }
        },
        query: { bool: { filter: { bool: { must: [
          { term: { thingName } },
          { range: { timestamp: {
            gte: + new Date() - (12 * 60 * 60 * 1000), // 12 hours
            lte: + new Date()
            } } }
        ],
        should: [
          { exists: { field: 'state.v10' } },
          { exists: { field: 'state.v25' } },
          { exists: { field: 'state.tmp' } },
          { exists: { field: 'state.hum' } }
        ] } } } }
      }
    })
    .then(r => { return r.aggregations.hist.buckets })
    .then(buckets => {
      // Issue compute heavy task to web-worker
      return worker.postMessage('set_histogram', [buckets])
        .then(res => {
          commit(t.APP_SET_HISTOGRAM, { thingName, res })
          return Promise.resolve()
        })
    })
    .catch(e => {
      console.log(e)
      return Promise.reject(e)
    })
  }
}

const getters = {
  auth: (state) => {
    return state.auth
  },
  names: (state) => {
    return state.names
  },
  sensors: (state) => {
    let tmp = state.sensors

    // Add names from map
    try {
      for (let key in tmp) {
        tmp[key].id = key
        
        if (state.names.hasOwnProperty(key))
          tmp[key].name = state.names[key]
        else
          tmp[key].name = 'Unnamed'
      }
    } catch (e) {
      console.log(e)
    }

    return tmp
  },
  histogram: (state) => {
    return state.histograms
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
