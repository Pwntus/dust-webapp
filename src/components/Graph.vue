<template lang="pug">
md-card.graph
  .update
  md-card-header
    md-card-header-text
      .md-title
        | {{ data.name }}
        classifier(:data="data")
      .md-subhead {{ when }}
  md-card-content
    .md-layout
      .md-layout-item.md-size-50
        span.md-body-2.grey PM 2.5
        .gauge(ref="pm25")
      .md-layout-item.md-size-50
        span.md-body-2 PM 10
        .gauge(ref="pm10")
    .md-layout.hist-layout
      .hist(ref="hist")
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
    },
    thingName: {
      type: String,
      required: true
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
    },
    histogram: {
      handler: 'reloadHist',
      deep: true
    }
  },
  computed: {
    histogram () {
      let hist = this.$store.getters['App/histogram']
      if (!hist.hasOwnProperty(this.thingName)) {
        return {
          date: [],
          pm25: [],
          pm10: []
        }
      }
      return hist[this.thingName]
    }
  },
  methods: {
    reload () {
      this.$chart25.load({
        unload: true,
        columns: [ ['data', this.data.pm25] ]
      })
      this.$chart10.load({
        unload: true,
        columns: [ ['data', this.data.pm10] ]
      })
    },
    reloadHist () {
      this.$chartHist.load({
        columns: [
          ['x', ...this.histogram.date],
          ['PM 2.5', ...this.histogram.pm25],
          ['PM 10', ...this.histogram.pm10]
        ]
      })
    }
  },
  mounted () {
    this.$chart25 = c3.generate({
      bindto: this.$refs['pm25'],
      data: {
        columns: [ ['µg/m³', this.data.pm25] ],
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
      },
      padding: { bottom: 2 }
    })
    this.$chart10 = c3.generate({
      bindto: this.$refs['pm10'],
      data: {
        columns: [ ['µg/m³', this.data.pm10] ],
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
      },
      padding: { bottom: 2 }
    })
    this.$chartHist = c3.generate({
      bindto: this.$refs['hist'],
      data: {
        x: 'x',
        columns: [
          ['x', ...this.histogram.date],
          ['PM 2.5', ...this.histogram.pm25],
          ['PM 10', ...this.histogram.pm10]
        ]
      },
      axis: {
        x: {
          //show: false,
          type: 'timeseries',
          tick: {
            format: '%H:%S'
          }
        },
        y: {
          show: false,
          //max: 400
        }
      },
      grid: {
        y: {
          lines: [
            { value: 25, class: 'gl-one' },
            { value: 40, class: 'gl-two' },
            { value: 150, class: 'gl-three' },
            { value: 400, class: 'gl-four' }
          ]
        }
      },
      color: { pattern: ['#000000', '#000000'] },
      point: { show: false },
      legend: { show: false },
      size: { height: 150 }
    })

    this.timeout = setInterval(() => {
      this.when = moment(this.data.timestamp).fromNow()
    }, 10000)
  },
  beforeDestroy () {
    this.$chart25 = this.$chart25.destroy()
    this.$chart10 = this.$chart10.destroy()
    this.$chartHist = this.$chartHist.destroy()
    clearInterval(this.timeout)
  }
}
</script>

<style lang="scss">
.graph {

  .md-card-content {
    padding-bottom: 5px;

    .md-body-2 {
      text-align: center;
      display: block;

      &.grey {
        color: #666666;
      }
    }

    .c3-chart-arcs-background {
      fill: #e0e0e0;
      stroke: none;
    }
    .c3 path, .c3 line { 
      stroke: #fff;
    }
    .c3 svg {
      overflow: visible !important;
    }

    .hist-layout {
      padding-top: 10px;

      .c3-ygrid-line {
        &.gl-one line {
          stroke: rgba(110, 232, 110, .4);
        }
        &.gl-two line {
          stroke: rgba(255, 153, 0, .4);
        }
        &.gl-three line {
          stroke: rgba(255, 0, 0, .4);
        }
        &.gl-four line {
          stroke: rgba(153, 0, 153, .4);
        }
      }

      .c3-target-PM-2-5 {
        .c3-line {
          stroke-dasharray: 5,5 !important;
        }
      }
    }
  }
}
</style>
