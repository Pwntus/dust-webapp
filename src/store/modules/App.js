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
        dispatch('getNames')
        commit(t.APP_SET_AUTH, 1)
        MQTT.init(ctx)
        return Promise.resolve(account)
      })
  },
  getNames ({commit}) {
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
