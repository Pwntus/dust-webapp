<template lang="pug">
#init-dust
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { REFRESH_HIST, TOPIC } from '@/config'
import { MQTT } from '@/lib/MQTT'

export default {
  name: 'InitDust',
  data: () => ({
    proc: null,
    timeout: null
  }),
  computed: mapGetters('App', ['sensors']),
  methods: {
    ...mapActions('Cognito', ['fetchSession', 'signInUser']),
    ...mapActions('App', ['getNames', 'getHistogram', 'message'])
  },
  async mounted () {
    // Sign in user if possible
    if (process.env.VUE_APP_MIC_USERNAME && process.env.VUE_APP_MIC_PASSWORD) {
      try {
        await this.fetchSession()
      } catch (e) {
        await this.signInUser({
          username: process.env.VUE_APP_MIC_USERNAME,
          password: process.env.VUE_APP_MIC_PASSWORD
        })
      } finally {
        MQTT.subscribe([TOPIC], ({ message }) => {
          try {
            const topic = Object.getOwnPropertySymbols(message).map(s => message[s])[0]
            this.message({ topic, message })
          } catch (e) {}
        })
        await this.getNames()
        this.proc = async () => {
          for (let thing in this.sensors) {
            try {
              await this.getHistogram(thing)
            } catch (e) {}
          }
        }
        this.timeout = setInterval(this.proc, REFRESH_HIST)
      }
    }
  },
  beforeDestroy () { clearInterval(this.timeout) }
}
</script>
