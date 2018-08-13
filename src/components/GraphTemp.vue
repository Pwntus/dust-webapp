<template lang="pug">
.graph-temp
  histogram(
    :chart-data="data"
    :options="options"
    ref="localHistogram"
  )
</template>

<script>
import Histogram from '@/components/Histogram'
import moment from 'moment'

export default {
  name: 'GraphTemp',
  props: ['histogram', 'type', 'max'],
  components: { Histogram },
  computed: {
    data () {
      return {
        labels: this.histogram.date.map(d => moment(d).format('HH:mm')),
        datasets: [{
          data: this.histogram[this.type].map(v => v.toFixed(2)),
          backgroundColor: '#00abec',
          borderColor: '#00abec',
          fill: false
        }]
      }
    },
    options () {
      return {
        legend: false,
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
          intersect: false,
          cornerRadius: 3,
          displayColors: false,
          callbacks: {
            label: (tooltipItem) => {
              var label = tooltipItem.yLabel
              if (parseFloat(label) <= 0.1)
                label = 'No data'

              return label
            }
          }
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 0
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
              fontSize: 10,
              source: 'data'
            }
          }],
          yAxes: [{
            display: true,
            gridLines: {
              display: false,
              drawBorder: false
            },
            ticks: {
              min: 0,
              max: this.max,
              autoSkip: false
            }
          }]
        }
      }
    }
  }
}
</script>

<style lang="stylus">
.graph-temp
  width 100%
  position relative

  canvas
    height 180px !important
</style>
