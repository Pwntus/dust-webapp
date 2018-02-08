<template lang="pug">
.hist(
  ref="hist"
  :id="'mg-'+ thingName"
)
</template>

<script>
import c3 from 'c3'
import { THRESHOLDS } from '@/config'

export default {
  name: 'Histogram',
  props: {
    thingName:    { type: String, required: true },
    particle:     { type: String, required: true },
    particleText: { type: String, required: true },
    frame:        { type: String, required: true }
  },
  watch: {
    histogram: {
      handler: 'reload',
      deep: true
    }
  },
  methods: {
    reload () {
      this.$hist.load({
        columns: [
          ['x', ...this.histogram.date],
          [this.particleText, ...this.histogram[this.particle]]
        ]
      })
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
    },
    thresholds () {
      return THRESHOLDS[this.particle][this.frame]
    },
    max () {
      return this.thresholds[this.thresholds.length - 1]
    },
    lines () {
      let tmp = []
      for (let i = 0; i < this.thresholds.length; i++)
        tmp.push({
          value: this.thresholds[i],
          class: `gl-${i}`
        })
      return tmp
    }
  },
  mounted () {
    this.$hist = c3.generate({
      bindto: this.$refs.hist,
      data: {
        x: 'x',
        columns: [
          ['x', ...this.histogram.date],
          [this.particleText, ...this.histogram[this.particle]]
        ]
      },
      axis: {
        x: {
          //show: false,
          type: 'timeseries',
          tick: {
            format: '%-I %p',
            fit: false
          }
        },
        y: {
          show: true,
          max: this.max,
          tick: { values: this.thresholds }
        }
      },
      grid: {
        lines: { front: false },
        y: { lines: this.lines }
      },
      color: { pattern: ['#000000'] },
      point: { show: false },
      legend: { show: false },
      size: { height: 190 },
      padding: { top: 0, left: 40, right: 20, bottom: 0 }
    })
  },
  beforeDestroy () {
    this.$hist = this.$hist.destroy()
  }
}
</script>

<style lang="scss">
.hist {
  &.c3 path, &.c3 line { 
    stroke: #fff;
  }
  &.c3 svg {
    overflow: visible !important;
  }
  .c3-axis-y, .c3-axis-x {
    text {
      fill: rgba(0, 0, 0, .5);
    }
  }
  .c3-ygrid-line {
    /*&.gl-0 line {
      stroke: rgba(110, 232, 110, .4);
    }*/
    &.gl-0 line {
      stroke: rgba(255, 153, 0, .4);
    }
    &.gl-1 line {
      stroke: rgba(255, 0, 0, .4);
    }
    &.gl-2 line {
      stroke: rgba(153, 0, 153, .4);
    }
  }
  .c3-line {
    stroke-width: 2px;
  }
}
</style>
