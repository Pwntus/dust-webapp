<template lang="pug">
.card.dust
  v-card-title
    .headline
      | {{ sensor.name }}
      .type
        | Dust Particles
        v-icon blur_on
    .subheader {{ when }}
  v-card-text
    v-container(fluid fill-height)
      v-layout(wrap)
        v-flex(xs9)
          graph(
            :histogram="histogram"
            particle="pm25"
          )
        v-flex(xs3)
          gauge(
            :value="sensor.v25"
            particle="pm25"
          )
        v-flex(xs9)
          graph(
            :histogram="histogram"
            particle="pm10"
          )
        v-flex(xs3)
          gauge(
            :value="sensor.v10"
            particle="pm10"
          )
</template>

<script>
import moment from 'moment'
import { mapActions, mapGetters } from 'vuex'
import Gauge from '@/components/cards/dust/Gauge'
import Graph from '@/components/cards/dust/Graph'

export default {
  name: 'Card',
  props: ['thingId'],
  components: {
    Gauge,
    Graph
  },
  data: () => ({
    when: 'Initializing...',
    timeout: null
  }),
  computed: {
    ...mapGetters('App', ['sensors', 'histograms']),
    sensor () {
      if (!this.sensors.hasOwnProperty(this.thingId))
        return { v10: null, v25: null, name: this.thingId }

      return this.sensors[this.thingId]
    },
    histogram () {
      if (!this.histograms.hasOwnProperty(this.thingId))
        return { date: [], pm25: [], pm10: [] }

      return this.histograms[this.thingId]
    }
  },
  methods: mapActions('App', ['getHistogram']),
  async mounted () {
    // Fetch histogram on mount
    try {
      await this.getHistogram(this.thingId)
    } catch (e) {}

    this.timeout = setInterval(() => {
      this.when = moment(this.sensor.timestamp).fromNow()
    }, 10000)
  },
  beforeDestroy () {
    clearInterval(this.timeout)
  }
}
</script>

<style lang="stylus">
.card.dust
  position relative

  .container
    padding 0

    .flex
      position relative
      height 50%

  .v-card__text
    position absolute
    top 72px
    bottom 0
    left 0
    right 0
</style>
