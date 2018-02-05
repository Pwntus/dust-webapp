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
  sensors: {}
}

const mutations = {
  [t.APP_SET_AUTH] (state, value) {
    state.auth = value
  },
  [t.APP_SET_DATA] (state, {id, message}) {
    try {
      let data = JSON.parse(message)

      state.sensors[id] = {
        data: data.state.reported,
        config: SENSORS[id]
      }
    } catch (e) {
      return
    }

    const copy = state.sensors
    state.sensors = Object.assign({}, copy)
  }
}

const actions = {
  auth ({commit}, {username, password, ctx}) {
    return MIC.login(username, password)
      .then(account => {
        commit(t.APP_SET_AUTH, 1)
        MQTT.init(ctx)
        return Promise.resolve(account)
      })
  },
  message ({commit}, {topic, message}) {
    const id = topic.slice(-8)
    if (!SENSORS.hasOwnProperty(id))
      return

    commit(t.APP_SET_DATA, {id, message})
  }
}

const getters = {
  auth: (state) => {
    return state.auth
  },
  sensors: (state) => {
    return state.sensors
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
