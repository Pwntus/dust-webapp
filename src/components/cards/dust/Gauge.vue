<template lang="pug">
.gauge(:class="{ visible: value !== null }")
  b {{ data.particleText }} µg/m³
  vue-circle(
    :progress="valuePc"
    :size="300"
    line-cap="round"
    :fill="data.fill"
    empty-fill="rgba(0, 0, 0, .05)"
    insert-mode="append"
    :thickness="15"
    :show-percent="false"
    ref="roundGauge"
  )
    p(:class="data.class")
      | {{ data.text }}
      br
      span {{ val.toFixed(1) }}
</template>

<script>
import VueCircle from 'vue2-circle-progress'
import { COLORS, THRESHOLDS, DEFAULT_FRAME } from '@/config'

const TEXT = ['Normal', 'Moderate', 'High', 'Extremely High']
const CLASS = ['normal', 'moderate', 'high', 'xhigh']
const OVERFLOW = 50

export default {
  name: 'Gauge',
  props: ['value', 'particle'],
  components: { VueCircle },
  watch: {
    value: {
      handler () {
        this.$refs.roundGauge.updateProgress(this.valuePc)
        this.$refs.roundGauge.updateFill(this.data.fill.color)
      }
    }
  },
  computed: {
    val () {
      return this.value === null ? 0 : this.value
    },
    th () {
      return THRESHOLDS[this.particle][DEFAULT_FRAME]
    },
    max () {
      return this.th[this.th.length - 1] + OVERFLOW
    },
    valuePc () {
      let pc = (this.val / this.max)
      pc = pc > 100 ? 100 : pc
      return pc * 100
    },
    data () {
      let index = 0
      for (let i = 0; i < this.th.length; i++) {
        if (this.val >= this.th[i])
          index = i + 1
      }
      let map = { pm25: 'PM 2.5', pm10: 'PM 10' }

      return {
        text: TEXT[index],
        class: CLASS[index],
        fill: { color: COLORS[index] },
        particleText: map[this.particle]
      }
    }
  }
}
</script>

<style lang="stylus">
.gauge
  width 100%
  height 100%
  position relative
  text-align center
  font-size 10px
  opacity 0

  -webkit-transition opacity 1s ease-in-out
  -moz-transition opacity 1s ease-in-out
  -ms-transition opacity 1s ease-in-out
  -o-transition opacity 1s ease-in-out
  transition opacity 1s ease-in-out

  &.visible
    opacity 1

  b
    padding-top 10px
    line-height 10px
    display block

  .circle
    width 100%
    height 100%
    position relative

    canvas
      max-width calc(100% - 30px)
      max-height calc(100% - 30px)

      // f*** u flexbox
      padding 0
      margin auto
      display block
      position absolute
      top 0
      bottom 0
      left 0
      right 0

    p
      line-height 15px
      margin 0

      &.normal   { color #53d053 }
      &.moderate { color #ff9900 }
      &.high     { color #ff0000 }
      &.xhigh    { color #990099 }

      span
        font-size 15px
</style>
