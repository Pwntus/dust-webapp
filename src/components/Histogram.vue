<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins
import 'chartjs-plugin-annotation'

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['options', 'chartData'],
  watch: {
    options: {
      handler (newOption, oldOption) {
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
