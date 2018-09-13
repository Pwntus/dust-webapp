<template lang="pug">
v-container(
  fluid
  grid-list-xl
)
  v-layout(column fill-height)
    //- Title, only shown if at dashboard
    v-flex
      .title(v-if="$route.path === '/'")
        .display-3
          | Environment at IFI
          .right
            a(href="https://startiot.telenor.com/" target="_blank")
              img(src="../assets/img/startiot-logo.png")
    v-flex.card-wrapper(fill-height)
      v-layout(
        fill-height
        wrap
        align-content-start
      )
        v-flex.layout-card(
          v-for="(item, index) in config"
          :key="index"
          :style="getCardHeightStyle()"
          xs12
          :md1="useColWidth(1)"
          :md2="useColWidth(2)"
          :md3="useColWidth(3)"
          :md4="useColWidth(4)"
          :md5="useColWidth(5)"
          :md6="useColWidth(6)"
          :md7="useColWidth(7)"
          :md8="useColWidth(8)"
          :md9="useColWidth(9)"
          :md10="useColWidth(10)"
          :md11="useColWidth(11)"
          :md12="useColWidth(12)"
        )
          v-card
            //- Bus Card
            template(v-if="item.name === 'bus-card'")
              bus-card(
                :title="item.title"
                :from="item.from"
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
              td-card
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
    config: null,
    layout: {
      rows: 2
    },
    showSettings: false
  }),
  methods: {
    useColWidth (n) {
      return this.cardColumnWidth === n
    },
    getCardHeightStyle () {
      let percentage = Math.floor(100 / this.layout.rows)
      return `height: ${percentage}%`
    }
  },
  computed: {
    cardColumnWidth () {
      let itemsPerRow = Math.ceil(this.config.length / this.layout.rows)
      if (itemsPerRow > 12)
        return 1
      else
        return Math.floor(12 / itemsPerRow)
    }
  },
  created () {
    if (typeof this.$route.params.query === 'undefined' && this.queryProp === false) {
      return
    }

    try {
      const widgetDefinitionsString = (this.queryProp === false) ? this.$route.params.query : this.queryProp
      const widgetDefinitions = JSON.parse(widgetDefinitionsString)
      this.config = widgetDefinitions.cards
      this.layout.rows = widgetDefinitions.rows
    } catch (e) {
      alert('Failed to parse your modules definition, try again')
      this.config = []
    }
  }
}
</script>

<style lang="stylus">
.container
  height 100%
  padding-bottom 0 !important

  .title
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
  .card-wrapper
    position relative
    margin-bottom 0 !important

  .layout-card
    .v-card
      position relative
      height 100%
</style>
