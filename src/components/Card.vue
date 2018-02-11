<template lang="pug">
.card.md-layout-item.md-size-33.md-medium-size-50.md-small-size-100.md-xsmall-size-100
  md-card
    md-card-header
      md-card-header-text
        .md-title {{ sensor.name }}
        .md-subhead {{ when }}
    md-card-content
      .md-layout.md-size-100
        gauge(
          :value="sensor.v25"
          particle="pm25"
        )
        graph(
          :histogram="histogram"
          particle="pm25"
        )
      .md-layout.md-size-100
        gauge(
          :value="sensor.v10"
          particle="pm10"
        )
        graph(
          :histogram="histogram"
          particle="pm10"
        )
</template>

<script>
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
    when: 'never'
  }),
  computed: {
    histogram () {
      let hist = this.$store.getters['App/histogram']
      if (!hist.hasOwnProperty(this.sensor.id))
        return { date: [], pm25: [], pm10: [] }

      return hist[this.sensor.id]
    }
  }
}
</script>

<style lang="scss" scoped>
.md-card {
  overflow: hidden;

  .md-title {
    margin-top: 0 !important;
  }

  .md-card-content {

  }
}
</style>
