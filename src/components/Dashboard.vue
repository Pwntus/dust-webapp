<template lang="pug">
#dashboard
  reloader(v-if="config === null")
  span.md-display-3(v-if="config === null")
    | Environment at IFI
    .right
      a(href="https://startiot.telenor.com/" target="_blank")
        img(src="../assets/img/startiot-logo.png")
      //a(href="http://airbit.uit.no/" target="_blank")
        img.airbit(src="../assets/img/airbit-logo.png")
    .c
  .md-layout.md-alignment-center(v-if="config === null")
    card(
      v-for="(sensor, index) in sensors"
      :sensor="sensor"
      :show-data="showData"
      :key="index"
    )
    bus-card(
      from="19021323:2"
      title="UiT Southbound"
    )
    bus-card(
      from="19021323:1"
      title="UiT Northbound"
    )
    airport-card(
      title="Tromsø Airport, Langnes"
      center="69.67,18.95"
      :zoom="9"
    )
    td-card
  .md-layout.md-alignment-center(v-if="config !== null")
    template(
      v-for="(item, index) in config"
      :index="index"
    )
      //- Bus Card
      template(v-if="item.name === 'bus-card'")
        bus-card(
          :title="item.title"
          :from="item.from"
          :fullscreen="fullscreen"
        )
      //- Airport Card
      template(v-if="item.name === 'airport-card'")
        airport-card(
          :title="item.title"
          :center="item.center"
          :zoom="item.zoom"
        )
      //- TD Card
      template(v-if="item.name === 'td-card'")
        td-card(
          :fullscreen="fullscreen"
        )
</template>

<script>
import Reloader from '@/components/Reloader'
import Card from '@/components/Card'
import BusCard from '@/components/BusCard'
import AirportCard from '@/components/AirportCard'
import TdCard from '@/components/TdCard'

export default {
  name: 'Dashboard',
  components: {
    Reloader,
    Card,
    BusCard,
    AirportCard,
    TdCard
  },
  props: {
    queryProp: {
      type: String,
      default: null
    }
  },
  data: () => ({
    timeout: null,
    showData: true,
    config: null
  }),
  computed: {
    sensors () {
      return this.$store.getters['App/sensors']
    },
    fullscreen () {
      return this.config.length <= 1
    }
  },
  methods: {
    toggleData () {
      this.showData = this.showData ? false : true
    }
  },
  created () {
    if (typeof this.$route.params.query === 'undefined' && this.queryProp === false) {
      return
    }

    try {
      const widgetDefinitions = (this.queryProp === false) ? this.$route.params.query : this.queryProp
      this.config = JSON.parse(widgetDefinitions)
    } catch (e) {
      alert('Failed to parse your modules definition, try again')
      this.config = []
      return
    }
  },
  beforeDestroy () {
    clearInterval(this.toggleData)
  }
}
</script>

<style lang="stylus" scoped>
#dashboard
  .md-display-3
    padding-bottom 20px
    display block

    .right
      padding-top 23px
      float right

      img
        height 25px
        margin 0 20px 0 20px
        border 0
        float right

        &.airbit
          margin 0 0 0 20px

    .c
      clear both

  .md-layout-item
    padding 0 20px 20px 0
</style>
