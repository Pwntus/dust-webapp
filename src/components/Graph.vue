<template lang="pug">
md-card.graph
  .update
  md-card-header
    md-card-header-text
      .md-title
        | {{ data.config.name }}
        classifier(:data="data.data")
      .md-subhead {{ when }}
  md-card-content
    .md-layout
      .md-layout-item.md-size-50
        span.md-body-2 PM 2.5
        .gauge(ref="pm25")
      .md-layout-item.md-size-50
        span.md-body-2 PM 10
        .gauge(ref="pm10")
</template>

<script>
import Classifier from '@/components/Classifier'
import moment from 'moment'
import c3 from 'c3'
import {
  COLORS,
  THRESHOLDS
} from '@/config'

export default {
  name: 'Graph',
  components: { Classifier },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    when: 'never',
    timeout: null
  }),
  watch: {
    data: {
      handler: 'reload',
      deep: true
    }
  },
  methods: {
    reload () {
      this.$chart25.load({
        unload: true,
        columns: [ ['data', this.data.data.pm25] ]
      })
      this.$chart10.load({
        unload: true,
        columns: [ ['data', this.data.data.pm10] ]
      })
    }
  },
  mounted () {
    this.$chart25 = c3.generate({
      bindto: this.$refs['pm25'],
      data: {
        columns: [ ['data', this.data.data.pm25] ],
        type: 'gauge'
      },
      gauge: {
        label: {
           format: (value, ratio) => { return value },
           show: true
        },
        expand: false,
        units: ' µg/m³',
        max: THRESHOLDS.pm25.hour[THRESHOLDS.pm25.hour.length - 1],
        width: 15
      },
      color: {
        pattern: COLORS,
        threshold: { values: THRESHOLDS.pm25.hour} 
      }
    })
    this.$chart10 = c3.generate({
      bindto: this.$refs['pm10'],
      data: {
        columns: [ ['data', this.data.data.pm10] ],
        type: 'gauge'
      },
      gauge: {
        label: {
           format: (value, ratio) => { return value },
           show: true
        },
        expand: false,
        units: ' µg/m³',
        max: THRESHOLDS.pm10.hour[THRESHOLDS.pm10.hour.length - 1],
        width: 15
      },
      color: {
        pattern: COLORS,
        threshold: { values: THRESHOLDS.pm10.hour }
      }
    })

    this.timeout = setInterval(() => {
      this.when = moment(this.data.data.timestamp).fromNow()
    }, 1000)
  },
  beforeDestroy () {
    this.$chart25 = this.$chart25.destroy()
    this.$chart10 = this.$chart10.destroy()
    clearInterval(this.timeout)
  }
}
</script>

<style lang="scss">
.graph {

  .c3-chart-arcs-background {
    fill: #e0e0e0;
    stroke: none;
  }

  .md-body-2 {
    text-align: center;
    display: block;
  }
}
</style>
