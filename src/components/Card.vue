<template lang="pug">
.card.md-layout-item.md-size-33.md-medium-size-50.md-small-size-100.md-xsmall-size-100
  md-card
    md-card-header
      md-card-header-text
        .md-title
          | {{ sensor.name }}
          .type
            | {{ dataText }}
            md-icon {{ dataIcon }}
        .md-subhead {{ when }}
    md-card-content
      .md-layout(:class="dataClass")
        .md-layout-item.md-size-80
          graph(
            :histogram="histogram"
            particle="pm25"
          )
        .md-layout-item.md-size-20.md-alignment-center-center
          gauge(
            :value="sensor.v25"
            particle="pm25"
          )
        .md-layout-item.md-size-80
          graph(
            :histogram="histogram"
            particle="pm10"
          )
        .md-layout-item.md-size-20.md-alignment-center-center
          gauge(
            :value="sensor.v10"
            particle="pm10"
          )
      .md-layout.margin
        .md-layout(v-if="sensor.tmp !== null && sensor.hum !== null")
          .md-layout-item.md-size-80
            graph-temp(
              :histogram="histogram"
              type="tmp"
            )
          .md-layout-item.md-size-20.md-alignment-center-center
            gauge-temp(
              :value="sensor.tmp"
              data-text="Temperature"
            )
          .md-layout-item.md-size-80
            graph-temp(
              :histogram="histogram"
              type="hum"
            )
          .md-layout-item.md-size-20.md-alignment-center-center
            gauge-temp(
              :value="sensor.hum"
              data-text="Humidity"
            )
        md-empty-state(
          v-if="sensor.tmp == null && sensor.hum == null"
          md-icon="visibility_off"
          md-label="No Data"
          md-description="This device is not configured to send this type of data"
        )
</template>

<script>
import moment from 'moment'
import Gauge from '@/components/Gauge'
import GaugeTemp from '@/components/GaugeTemp'
import Graph from '@/components/Graph'
import GraphTemp from '@/components/GraphTemp'

export default {
  name: 'Card',
  props: ['sensor', 'showData'],
  components: {
    Gauge,
    GaugeTemp,
    Graph,
    GraphTemp
  },
  data: () => ({
    when: 'never',
    timeout: null
  }),
  computed: {
    histogram () {
      let hist = this.$store.getters['App/histogram']
      if (!hist.hasOwnProperty(this.sensor.id))
        return { date: [], pm25: [], pm10: [] }

      return hist[this.sensor.id]
    },
    dataText () {
      return this.showData ? 'Dust Particles' : 'Temperature & Humidity'
    },
    dataIcon () {
      return this.showData ? 'blur_on' : 'ac_unit'
    },
    dataClass () {
      return this.showData ? '' : 'hidden'
    }
  },
  mounted () {
    this.timeout = setInterval(() => {
      this.when = moment(this.sensor.timestamp).fromNow()
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

  .md-card-header {
    padding-bottom: 0;
    background: #FFF;
    
    .md-title {
      margin-top: 0 !important;
    }

    .type {
      font-size: 12px;
      font-weight: 500;
      line-height: 28px;
      color: rgba(0,0,0,.7);
      float: right;

      .md-icon {
        margin-left: 10px;
        font-size: 18px;
        float: right;
      }
    }
  }

  .md-card-content {
    height: 385px;
    overflow: hidden;
    padding: 0 10px 10px !important;


    .md-layout {
      margin-top: 0;
      align-items: center;

      -webkit-transition: all .5s ease-in-out;
      -moz-transition: all .5s ease-in-out;
      -o-transition: all .5s ease-in-out;
      transition: all .5s ease-in-out;

      &.hidden {
        margin-top: -380px;
      }

      &.margin {
        margin-top: 10px;
      }
    }
  }
}
</style>
