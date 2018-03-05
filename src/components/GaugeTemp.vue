<template lang="pug">
.gauge-temp
  vue-circle(
    :progress="valuePc"
    :size="150"
    line-cap="round"
    :fill="fill"
    empty-fill="rgba(0, 0, 0, .05)"
    insert-mode="append"
    :thickness="8"
    :show-percent="false"
    ref="roundGauge"
  )
    p
      | {{ dataText }}
      br
      span {{ value.toFixed(1) }}
</template>

<script>
import VueCircle from 'vue2-circle-progress'

export default {
  name: 'GaugeTemp',
  props: ['value', 'dataText'],
  components: { VueCircle },
  data: () => ({
    max: 50,
    fill: {
      color: blue
    }
  }),
  watch: {
    value: {
      handler (newValue, oldValue) {
        this.$refs.roundGauge.updateProgress(this.valuePc)
        this.$refs.roundGauge.updateFill(this.data.fill.color)
      }
    }
  },
  computed: {
    valuePc () {
      let pc = (this.value / this.max)
      pc = pc > 100 ? 100 : pc
      return pc * 100
    }
  }
}
</script>

<style lang="scss">
.gauge-temp {
  width: 100%;
  position: relative;
  text-align: center;
  font-size: 10px;

  .circle {
    p {
      line-height: 15px;

      span {
        font-size: 15px;
      }
    }
  }
}
</style>
