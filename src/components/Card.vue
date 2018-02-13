<template lang="pug">
.card.md-layout-item.md-size-33.md-medium-size-50.md-small-size-100.md-xsmall-size-100
  md-card
    md-card-header
      md-card-header-text
        .md-title {{ sensor.name }}
        .md-subhead {{ when }}
    md-card-content
      .md-layout
        .md-layout-item.md-size-80
          graph(
            :histogram="histogram"
            particle="pm25"
          )
        .md-layout-item.md-size-20.md-alignment-center-center
          gauge(
            :value="sensor.v25"
            particle="pm25"
          )
        .md-layout-item.md-size-80
          graph(
            :histogram="histogram"
            particle="pm10"
          )
        .md-layout-item.md-size-20.md-alignment-center-center
          gauge(
            :value="sensor.v10"
            particle="pm10"
          )
</template>

<script>
import moment from 'moment'
import Gauge from '@/components/Gauge'
import Graph from '@/components/Graph'

export default {
  name: 'Card',
  props: ['sensor'],
  components: {
    Gauge,
    Graph
  },
  data: () => ({
    when: 'never',
    timeout: null
  }),
  computed: {
    histogram () {
      let hist = this.$store.getters['App/histogram']
      if (!hist.hasOwnProperty(this.sensor.id))
        return { date: [], pm25: [], pm10: [] }

      return hist[this.sensor.id]
    }
  },
  mounted () {
    this.timeout = setInterval(() => {
      this.when = moment(this.sensor.timestamp).fromNow()
    }, 10000)
  },
  beforeDestroy () {
    clearInterval(this.timeout)
  }
}
</script>

<style lang="scss" scoped>
.md-card {
  overflow: hidden;

  .md-card-header {
    padding-bottom: 0;
    
    .md-title {
      margin-top: 0 !important;
    }
  }

  .md-card-content {
    padding: 0 10px 10px !important;

    .md-layout {
      align-items: center;
    }
  }
}
</style>
