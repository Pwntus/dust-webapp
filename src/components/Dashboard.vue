<template lang="pug">
#dashboard
  span.md-display-3(v-if="config === null")
    | Environment at IFI
    .right
      a(href="https://startiot.telenor.com/" target="_blank")
        img(src="../assets/img/startiot-logo.png")
      //a(href="http://airbit.uit.no/" target="_blank")
        img.airbit(src="../assets/img/airbit-logo.png")
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
import BusCard from '@/components/cards/BusCard'
import AirportCard from '@/components/cards/AirportCard'
import TdCard from '@/components/cards/TdCard'

export default {
  name: 'Dashboard',
  components: {
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
    config: null
  }),
  computed: {
    fullscreen () {
      return this.config.length <= 1
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
