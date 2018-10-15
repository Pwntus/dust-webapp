/* eslint-disable */
import SWorker from 'simple-web-worker'
import { API } from 'aws-amplify'
import * as t from '@/store/types'
import { API_NAME, THING_TYPE } from '@/config'

let worker = SWorker.create([{
  message: 'set_histogram',
  func: buckets => {
    let tmp = null

    try {
      tmp = buckets.map(bucket => {
        return {
          date: bucket.key,
          pm25: (bucket.v25.value == null) ? 0 : bucket.v25.value,
          pm10: (bucket.v10.value == null) ? 0 : bucket.v10.value
        }
      })
      .reduce((a, b) => {
        a.date.push(b.date)
        a.pm25.push(b.pm25)
        a.pm10.push(b.pm10)
        return a
      }, {
        date: [],
        pm25: [],
        pm10: []
      })

      // We have data
      if (tmp.date.length > 0) {

        let x = []
        let latest = tmp.date[tmp.date.length - 1]
        for (let i = 0; i < 96; i++) { // Number of intervals to traverse
          x.unshift(latest)
          latest -= 15 * 60 * 1000
        }

        let final = {
          date: x,
          pm25: [],
          pm10: []
        }
        let ocount = 0
        for (let i = 0; i < x.length; i++) {

          if (!tmp.date.includes(x[i])) {
            final.pm25.push(0.1)
            final.pm10.push(0.1)
          } else {
            final.pm25.push(tmp.pm25[ocount])
            final.pm10.push(tmp.pm10[ocount])
            ocount++
          }
        }

        tmp = final
      }

      return tmp

    } catch (e) {
      return null
    }
  }
}])

const state = {
  sensors: {},
  names: {},
  histograms: {}
}

const mutations = {
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
      return
    }
  },
  [t.APP_SET_HISTOGRAM] (state, { thingName, worker_result }) {
    // Copy for reactivity
    let copy = Object.assign({}, state.histograms)
    copy[thingName] = worker_result
    state.histograms = copy
  }
}

const actions = {
  message ({commit, dispatch}, { topic, message }) {
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
  async getNames ({ commit }) {
    let result = [] // Default value

    try {
      const response = await API.post(API_NAME, '/things/find', {
        body: {
          query: {
            size: 50,
            query: { term: { thingType: THING_TYPE } }
          }
        }
      })
      result = response.hits.hits
    } catch (e) {
      throw e
    } finally {
      commit(t.APP_SET_NAMES, result)
    }
  },
  async getHistogram ({ state, commit }, thingName = null) {
    try {
      // Fetch for all sensors
      if (thingName == null) {
        thingName = []
        for (let key in state.sensors)
          thingName.push(key)

        if (thingName.length <= 0)
          return
      }

      // Format correct terms-clause in ES query
      if (thingName.constructor !== Array)
        thingName = [thingName]

      const response = await API.post(API_NAME, '/observations/find', {
        body: {
          queryScope: {
            thingTypes: [ THING_TYPE ]
          },
          query: {
            size: 0,
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
                  v25: { avg: { field: 'state.v25' } }
                }
              }
            },
            query: { bool: { filter: { bool: { must: [
              { terms: { thingName: thingName } },
              { range: { timestamp: {
                gte: + new Date() - (24 * 60 * 60 * 1000), // 24 hours
                lte: + new Date()
                } } }
            ],
            should: [
              { exists: { field: 'state.v10' } },
              { exists: { field: 'state.v25' } }
            ] } } } }
          }
        }
      })

      const buckets = response.aggregations.hist.buckets
      const worker_result = await worker.postMessage('set_histogram', [buckets])
      commit(t.APP_SET_HISTOGRAM, { thingName, worker_result })
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}

const getters = {
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
      return []
    }

    return tmp
  },
  histograms: (state) => {
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
