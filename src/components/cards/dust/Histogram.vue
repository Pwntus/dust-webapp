<script>
import { Line, mixins } from 'vue-chartjs'
import 'chartjs-plugin-annotation'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['chartData', 'options'],
  watch: {
    options: {
      handler () {
        this.$data._chart.destroy()
        this.renderChart(this.chartData, this.options)
      },
      deep: true
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>
