<template lang="pug">
.graph
  histogram(:chart-data="data")
</template>

<script>
import Histogram from '@/components/Histogram'
import moment from 'moment'

export default {
  name: 'Graph',
  props: ['histogram', 'particle'],
  components: { Histogram },
  computed: {
    data () {
      return {
        labels: this.histogram.date.map(d => moment(d).format('h A')),
        datasets: [{
          data: this.histogram[this.particle]
        }]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.graph {
  width: 100%;
  position: relative;
}
</style>
