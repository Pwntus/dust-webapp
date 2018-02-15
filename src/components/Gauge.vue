<template lang="pug">
.gauge
  b {{ data.particleText }} µg/m³
  vue-circle(
    :progress="valuePc"
    :size="150"
    line-cap="round"
    :fill="data.fill"
    empty-fill="rgba(0, 0, 0, .05)"
    insert-mode="append"
    :thickness="8"
    :show-percent="false"
    ref="roundGauge"
  )
    p(:class="data.class")
      | {{ data.text }}
      br
      span {{ value.toFixed(1) }}
</template>

<script>
import VueCircle from 'vue2-circle-progress'
import {
  COLORS,
  THRESHOLDS,
  DEFAULT_FRAME
} from '@/config'

const TEXT  = ['Normal', 'Moderate', 'High', 'Extremely High']
const CLASS = ['normal', 'moderate', 'high', 'xhigh']
const OVERFLOW = 50

export default {
  name: 'Gauge',
  props: ['value', 'particle'],
  components: { VueCircle },
  watch: {
    value: {
      handler (newValue, oldValue) {
        this.$refs.roundGauge.updateProgress(this.valuePc);
      }
    }
  },
  computed: {
    th () {
      return THRESHOLDS[this.particle][DEFAULT_FRAME]
    },
    max () {
      return this.th[this.th.length - 1] + OVERFLOW
    },
    valuePc () {
      let pc = (this.value / this.max)
      //pc = pc > 1 ? 1 : pc
      return pc * 100
    },
    data () {
      let index = 0
      for (let i = 0; i < this.th.length; i++) {
        if (this.value >= this.th[i])
          index = i + 1
      }
      let map = { pm25: 'PM 2.5', pm10: 'PM 10'}
      return {
        text:  TEXT[index],
        class: CLASS[index],
        particleText: map[this.particle],
        fill: { color: COLORS[index] }
      }
    }
  }
}
</script>

<style lang="scss">
.gauge {
  width: 100%;
  position: relative;
  text-align: center;
  font-size: 10px;

  b {
    padding-bottom: 5px;
    line-height: 10px;
    display: block;
  }

  .circle {
    p {
      line-height: 15px;

      &.normal   { color: #53d053; }
      &.moderate { color: #ff9900; }
      &.high     { color: #ff0000; }
      &.xhigh    { color: #990099; }

      span {
        font-size: 15px;
      }
    }
  }

  .info {
    
  }
}
</style>
