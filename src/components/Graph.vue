<template lang="pug">
.graph
  histogram(
    :chart-data="data"
    :options="options"
    ref="localHisto"
  )
</template>

<script>
import Histogram from '@/components/Histogram'
import moment from 'moment'
import {
  COLORS,
  THRESHOLDS,
  DEFAULT_FRAME
} from '@/config'

export default {
  name: 'Graph',
  props: ['histogram', 'particle'],
  components: { Histogram },
  computed: {
    config () {
      let th = THRESHOLDS[this.particle][DEFAULT_FRAME]
      let max = th[th.length - 1]

      return { max }
    },
    data () {
      return {
        labels: this.histogram.date.map(d => moment(d).format('h A')),
        datasets: [{
          data: this.histogram[this.particle].map(v => v.toFixed(2)),
          backgroundColor: this.gradient,
          borderColor: this.gradient,
          fill: false
        }]
      }
    },
    options () {
      return {
        legend: false,
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: {
            radius: 0,
            hoverRadius: 0,
            hitRadius: 40
          },
          line: {
            fill: false
          }
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false,
              drawBorder: false,
              zeroLineColor: 'transparent'
            },
            ticks: {
              maxRotation: 0
            }
          }],
          yAxes: [{
            gridLines: {
              display: false,
              drawBorder: false
            },
            ticks: {
              min: 0,
              max: this.config.max
            }
          }]
        }
      }
    }
  },
  data: () => ({
    gradient: null
  }),
  mounted () {
    let canvas = this.$refs.localHisto.$refs.canvas
    this.gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 200)
    this.gradient.addColorStop(0, 'red')
    this.gradient.addColorStop(0.5, 'red')
    this.gradient.addColorStop(0.5, 'orange');
    this.gradient.addColorStop(0.8, 'orange');
    this.gradient.addColorStop(0.8, 'green');
    this.gradient.addColorStop(1, 'green');
  }
}
</script>

<style lang="scss">
.graph {
  width: 100%;
  position: relative;

  canvas {
    height: 200px;
  }
}
</style>
