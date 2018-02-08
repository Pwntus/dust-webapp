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
        span.md-body-2
          b.dashed PM 2.5
        .gauge(ref="pm25")
      .md-layout-item.md-size-50
        span.md-body-2
          b PM 10
        .gauge(ref="pm10")
    .md-layout.hist-layout.show(v-bind:class="{ hide : showHist > 0 }")
      .hist(ref="hist25")
      .hist(ref="hist10")
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
    },
    showHist: {
      type: Number,
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
      this.$hist25.load({
        columns: [
          ['x', ...this.histogram.date],
          ['PM 2.5', ...this.histogram.pm25]
        ]
      })
      this.$hist10.load({
        columns: [
          ['x', ...this.histogram.date],
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
        width: 10
      },
      color: {
        pattern: COLORS,
        threshold: { values: THRESHOLDS.pm25.hour} 
      },
      padding: { bottom: 3 }
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
        width: 10
      },
      color: {
        pattern: COLORS,
        threshold: { values: THRESHOLDS.pm10.hour }
      },
      padding: { bottom: 3 }
    })

    this.$hist25 = c3.generate({
      bindto: this.$refs['hist25'],
      data: {
        x: 'x',
        columns: [
          ['x', ...this.histogram.date],
          ['PM 2.5', ...this.histogram.pm25]
        ]
      },
      axis: {
        x: {
          //show: false,
          type: 'timeseries',
          tick: {
            format: '%H'
          }
        },
        y: {
          show: true,
          max: 150,
          tick: {
            values: [25, 40, 150]
          }
        }
      },
      grid: {
        lines: { front: false },
        y: {
          lines: [
            //{ value: 25, class: 'gl-one' },
            { value: 25, class: 'gl-two' },
            { value: 40, class: 'gl-three' },
            { value: 150, class: 'gl-four' }
          ]
        }
      },
      color: { pattern: ['#000000'] },
      point: { show: false },
      legend: { show: false },
      size: { height: 190 },
      padding: { top: 0, left: 40, right: 20, bottom: 0 }
    })
    this.$hist10 = c3.generate({
      bindto: this.$refs['hist10'],
      data: {
        x: 'x',
        columns: [
          ['x', ...this.histogram.date],
          ['PM 10', ...this.histogram.pm10]
        ]
      },
      axis: {
        x: {
          //show: false,
          type: 'timeseries',
          tick: {
            format: '%H'//'%I %p'
          }
        },
        y: {
          show: true,
          max: 400,
          tick: {
            values: [50, 80, 400]
          }
        }
      },
      grid: {
        lines: { front: false },
        y: {
          lines: [
            //{ value: 50, class: 'gl-one' },
            { value: 50, class: 'gl-two' },
            { value: 80, class: 'gl-three' },
            { value: 400, class: 'gl-four' }
          ]
        }
      },
      color: { pattern: ['#000000'] },
      point: { show: false },
      legend: { show: false },
      size: { height: 190 },
      padding: { top: 0, left: 40, right: 20, bottom: 0 }
    })

    this.timeout = setInterval(() => {
      this.when = moment(this.data.timestamp).fromNow()
    }, 10000)
  },
  beforeDestroy () {
    this.$chart25 = this.$chart25.destroy()
    this.$chart10 = this.$chart10.destroy()
    this.$hist25 = this.$hist25.destroy()
    this.$hist10 = this.$hist10.destroy()
    clearInterval(this.timeout)
  }
}
</script>

<style lang="scss">
.graph {

  .md-card-content {
    padding: 0;

    .md-body-2 {
      text-align: center;
      display: block;

      b {
        border-bottom: 1px solid #000;

        &.dashed {
          border-bottom: 1px dashed #000;
        }
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

    .gauge {
      height: 100px;

      .c3-chart-arcs-gauge-unit {
        font-size: 12px !important;
      }

      .c3-gauge-value {
        font-size: 15px !important;
      }
    }

    .hist-layout {
      height: 200px;
      padding-top: 10px;
      overflow-y: hidden;

      &.show {
        .hist:first-child {
          margin-top: 0;
          -webkit-transition: all .5s ease-in-out;
          -moz-transition: all .5s ease-in-out;
          -o-transition: all .5s ease-in-out;
          transition: all .5s ease-in-out;
        }
      }

      &.hide {
        .hist:first-child {
          margin-top: -190px;
          -webkit-transition: all .5s ease-in-out;
          -moz-transition: all .5s ease-in-out;
          -o-transition: all .5s ease-in-out;
          transition: all .5s ease-in-out;
        }
      }

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

        /*& line {
          stroke: rgba(0, 0, 0, .1) !important;
        }*/
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
