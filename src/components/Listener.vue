<template lang="pug">
#listener
</template>

<script>
export default {
  name: 'Listener',
  created () {
    this.bus.$on('mqtt:connect', () => {
      // eslint-disable-next-line
      console.log('MQTT client connected.')
    })
    this.bus.$on('mqtt:close', () => {
      // eslint-disable-next-line
      console.log('Connection closed.')
    })
    this.bus.$on('mqtt:error', (e) => {
      // eslint-disable-next-line
      console.log(`Error: ${e}`)
    })
    this.bus.$on('mqtt:subscribe', (topic) => {
      // eslint-disable-next-line
      console.log(`Subscribing to topic: ${topic}`)
    })
    this.bus.$on('mqtt:message', (topic, message) => {
      this.$store.dispatch('App/message', {topic, message})
    })
  },
  beforeDestroy () {
    this.bus.$off('mqtt:connect')
    this.bus.$off('mqtt:close')
    this.bus.$off('mqtt:error')
  }
}
</script>
