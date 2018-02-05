<template lang="pug">
md-chip.classifier(:class="classText")
  | {{ text }}
</template>

<script>
import {
  COLORS,
  THRESHOLDS
} from '@/config'

const type = 'hour' // hour | day
const t_pm25 = THRESHOLDS.pm25[type]
const t_pm10 = THRESHOLDS.pm10[type]

export default {
  name: 'Classifier',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    max () {

      let pm25 = this.data.pm25
      let pm10 = this.data.pm10

      let pm25_low = 0
      for (let i = 0; i < t_pm25.length; i++) {
        if (pm25 >= t_pm25[i])
          pm25_low = i + 1
      }

      let pm10_low = 0
      for (let j = 0; j < t_pm10.length; j++) {
        if (pm10 >= t_pm10[j])
          pm10_low = j + 1
      }

      return Math.max(pm25_low, pm10_low)
    },
    text () {
      let strs = ['Normal', 'Moderate', 'High', 'Extremely High']
      return strs[this.max]
    },
    classText () {
      let strs = ['normal', 'moderate', 'high', 'xhigh']
      return strs[this.max]
    }
  }
}
</script>

<style lang="scss" scoped>
.classifier {
  &.normal {
    background-color: #53d053;
  }
  &.moderate {
    background-color: #ff9900;
  }
  &.high {
    background-color: #ff0000;
  }
  &.xhigh {
    background-color: #990099;
  }

  color: #FFF !important;
  float: right;
  border-radius: 3px !important;
}
</style>
