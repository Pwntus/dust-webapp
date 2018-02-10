<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins
import { THRESHOLDS } from '@/config'
import '@/lib/Chart.Bands.min'

export default {
  extends: Line,
  mixins: [reactiveProp],
  data: () => ({
    options: {
      legend: false,
      responsive: true,
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
          }
        }],
        yAxes: [{
          gridLines: {
            drawBorder: false
          },
          ticks: {
            min: 0,
            max: 30
          }
        }]
      },
      bands: [
      {
        from: 0,
        to: 20,
        yValue: 5,
        color: 'red'
      }
      ]
    }
  }),
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>
