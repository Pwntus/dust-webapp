<template lang="pug">
md-card.graph
  md-card-header
    md-card-header-text
      .md-title {{ data.config.name }}
      .md-subhead {{ data.data.timestamp }}
  md-card-content
    .chart(:ref="index")
</template>

<script>
import c3 from 'c3'
import {
  COLORS,
  THRESHOLDS
} from '@/config'

export default {
  name: 'Graph',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: String,
      required: true
    }
  },
  data: () => ({
    chart25: null
  }),
  mounted () {
    this.$nextTick(() => {
      this.chart25 = c3.generate({
        bindto: this.$refs[this.index],
        data: {
          columns: [
            ['data', this.data.data.pm25]
          ],
          type: 'gauge'
        },
        gauge: {
          label: {
             format: (value, ratio) => {
                 return value
             },
             show: true
          },
          expand: false,
          units: ' µg/m³',
          max: THRESHOLDS.pm25.hour[THRESHOLDS.pm25.hour.length - 1]
        },
        color: {
          pattern: COLORS,
          threshold: {
            values: THRESHOLDS.pm25.hour
          }
        }
      })
    })
  }
}
</script>

<style lang="scss">
.graph {
  .c3-chart-arcs-background {
    fill: #e0e0e0;
    stroke: none;
  }
}
</style>
