<template lang="pug">
.gauge(ref="gauge")
</template>

<script>
import c3 from 'c3'
import {
  COLORS,
  THRESHOLDS
} from '@/config'

const UNIT = 'µg/m³'
const WIDTH = 10

export default {
  name: 'Gauge',
  props: {
    value:    { type: Number, required: true },
    particle: { type: String, required: true },
    frame:    { type: String, required: true }
  },
  watch: {
    value: {
      handler: 'reload',
      deep: true
    }
  },
  methods: {
    reload () {
      this.$gauge.load({
        unload: true,
        columns: [ [UNIT, this.value] ]
      })
    }
  },
  mounted () {
    this.$gauge = c3.generate({
      bindto: this.$refs.gauge,
      data: {
        columns: [ [UNIT, this.value] ],
        type: 'gauge'
      },
      gauge: {
        label: {
           format: (value, ratio) => { return value },
           show: true
        },
        expand: false,
        units: ` ${UNIT}`,
        max: THRESHOLDS[this.particle][this.frame][THRESHOLDS[this.particle][this.frame].length - 1],
        width: WIDTH
      },
      color: {
        pattern: COLORS,
        threshold: { values: THRESHOLDS[this.particle][this.frame] } 
      },
      padding: { bottom: 3 }
    })
  },
  beforeDestroy () {
    this.$gauge = this.$gauge.destroy()
  }
}
</script>

<style lang="scss">
.gauge {
  max-height: 100px;

  .c3-chart-arcs-background {
    fill: #e0e0e0;
    stroke: none;
  }
  .c3-chart-arcs-gauge-unit {
    font-size: 12px !important;
  }
  .c3-gauge-value {
    font-size: 15px !important;
  }
}
</style>
