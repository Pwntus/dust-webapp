<template lang="pug">
.gauge
  md-chip(:class="data.class") {{ particle }} {{ data.text }} ({{ value.toFixed(2) }})
  md-progress-bar(
    md-mode="determinate"
    :md-value="(value / max) * 100"
    :class="data.class"
  )
</template>

<script>
import c3 from 'c3'
import {
  COLORS,
  THRESHOLDS,
  DEFAULT_FRAME
} from '@/config'

const TEXT  = ['Normal', 'Moderate', 'High', 'Extremely High']
const CLASS = ['normal', 'moderate', 'high', 'xhigh']

export default {
  name: 'Gauge',
  props: ['value', 'particle'],
  computed: {
    th () {
      return THRESHOLDS[this.particle][DEFAULT_FRAME]
    },
    max () {
      return this.th[this.th.length - 1]
    },
    data () {
      let index = 0
      for (let i = 0; i < this.th.length; i++) {
        if (this.value >= this.th[i])
          index = i + 1
      }
      return {
        text:  TEXT[index],
        class: CLASS[index]
      }
    }
  }
}
</script>

<style lang="scss">
.gauge {
  width: 100%;

  .md-chip {
    height: 23px;
    padding: 0 10px;
    color: #FFF;
    line-height: 23px;
    border-radius: 5px 0 0 5px;
    font-size: 11px;
    float: left;

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
  }

  .md-progress-bar {
    height: 23px;
    border-radius: 0 5px 5px 0;
    background-color: rgba(0, 0, 0, .02) !important;

    &.normal {
      .md-progress-bar-fill {
        background-color: #53d053;
      }
    }
    &.moderate {
      .md-progress-bar-fill {
        background-color: #ff9900;
      }
    }
    &.high {
      .md-progress-bar-fill {
        background-color: #ff0000;
      }
    }
    &.xhigh {
      .md-progress-bar-fill {
        background-color: #990099;
      }
    }
  }
}
</style>
