<template lang="pug">
md-card
  md-card-header
    md-card-header-text
      .md-title
        | {{ data.name }}
        classifier(:data="data")
      .md-subhead {{ when }}
  md-card-content
    .md-layout
      .md-layout-item.md-size-50(v-bind:class="{ faded : showHist > 0}")
        span.md-body-2 PM 2.5
        gauge(
          :value="data.pm25"
          particle="pm25"
          frame="hour"
        )
      .md-layout-item.md-size-50(v-bind:class="{ faded : showHist < 1}")
        span.md-body-2 PM 10
        gauge(
          :value="data.pm10"
          particle="pm10"
          frame="hour"
        )
    .md-layout.hist-layout(v-bind:class="{ hide : showHist > 0 }")
      histogram(
        :thing-name="thingName"
        particle="pm25"
        particle-text="PM 2.5"
        frame="hour"
      )
      histogram(
        :thing-name="thingName"
        particle="pm10"
        particle-text="PM 10"
        frame="hour"
      )
</template>

<script>
import Classifier from '@/components/Classifier'
import Gauge from '@/components/Gauge'
import Histogram from '@/components/Histogram'
import moment from 'moment'
import c3 from 'c3'
import {
  COLORS,
  THRESHOLDS
} from '@/config'

export default {
  name: 'Card',
  components: {
    Classifier,
    Gauge,
    Histogram
  },
  props: {
    data:      { type: Object, default: () => ({}) },
    thingName: { type: String, required: true },
    showHist:  { type: Number, required: true }
  },
  data: () => ({
    when: 'never',
    timeout: null
  }),
  mounted () {
    this.timeout = setInterval(() => {
      this.when = moment(this.data.timestamp).fromNow()
    }, 10000)
  },
  beforeDestroy () {
    clearInterval(this.timeout)
  }
}
</script>

<style lang="scss" scoped>
.md-card {
  overflow: hidden;

  .md-title {
    margin-top: 0 !important;
  }

  .md-card-content {
    padding: 0 !important;

    .faded {
      opacity: .2;
    }

    .md-body-2 {
      text-align: center;
      display: block;
    }

    .hist-layout {
      height: 200px;
      padding-top: 10px;
      overflow: hidden;

      .hist {
        width: 100%;
        margin-top: 0;
        -webkit-transition: all .5s ease-in-out;
        -moz-transition: all .5s ease-in-out;
        -o-transition: all .5s ease-in-out;
        transition: all .5s ease-in-out;
      }

      &.hide {
        .hist:first-child {
          margin-top: -190px;
        }
      }
    }

  }
}
</style>
