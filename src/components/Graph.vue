<template lang="pug">
.graph
  histogram(
    :chart-data="data"
    :options="options"
    ref="localHistogram"
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

const OVERFLOW = 50

export default {
  name: 'Graph',
  props: ['histogram', 'particle'],
  components: { Histogram },
  data: () => ({
    gradient: null
  }),
  computed: {
    th () {
      return THRESHOLDS[this.particle][DEFAULT_FRAME]
    },
    ratios () {
      return this.th.map(v => v / this.max)
    },
    max () {
      return this.th[this.th.length - 1] + OVERFLOW
    },
    annotations () {
      let annotations = []
      for (let i = 0; i < this.th.length; i++) {
        annotations.push({
          type: 'line',
          drawTime: 'beforeDatasetsDraw',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: this.th[i],
          borderColor: '#fff',
          borderWidth: 1,
          borderDash: [5, 1],
          label: {
            enabled: true,
            content: this.th[i],
            backgroundColor: '#FFF',
            position: 'left',
            fontSize: 9,
            fontColor: '#555',
            fontStyle: 'normal',
            xPadding: 4,
            yPadding: 0,
            xAdjust: -4
          }
        })
      }
      return annotations
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
            borderWidth: 2,
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
              maxRotation: 0,
              fontSize: 10
            }
          }],
          yAxes: [{
            display: false,
            gridLines: {
              display: false,
              drawBorder: false
            },
            ticks: {
              min: 0,
              max: this.max,
              beginAtZero: true
            }
          }]
        },
        annotation: { annotations: this.annotations }
      }
    }
  },
  mounted () {
    let canvas = this.$refs.localHistogram.$refs.canvas
    let chart = this.$refs.localHistogram.$data._chart

    let yAxis = chart.scales['y-axis-0']
    let minValueYPixel = yAxis.getPixelForValue(0)
    let maxValueYPixel = yAxis.getPixelForValue(this.max)
    this.gradient = canvas.getContext('2d').createLinearGradient(0, minValueYPixel, 0, maxValueYPixel)

    let curColor = COLORS[0]
    this.gradient.addColorStop(0, curColor)
    for (let i = 0; i < this.ratios.length; i++) {
      this.gradient.addColorStop(this.ratios[i], curColor)
      curColor = COLORS[i + 1]
      this.gradient.addColorStop(this.ratios[i], curColor)
    }
    // Overflow
    //this.gradient.addColorStop(this.ratios[this.ratios.length - 1], COLORS[COLORS.length - 1])
    //this.gradient.addColorStop(1, COLORS[COLORS.length - 1])
  }
}
</script>

<style lang="scss">
.graph {
  width: 100%;
  position: relative;

  canvas {
    height: 140px;
  }
}
</style>
