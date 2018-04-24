<template lang="pug">
#dashboard
  reloader
  span.md-display-3
    | Environment at IFI
    .right
      a(href="https://startiot.telenor.com/" target="_blank")
        img(src="../assets/img/startiot-logo.png")
      //a(href="http://airbit.uit.no/" target="_blank")
        img.airbit(src="../assets/img/airbit-logo.png")
    .c
  .md-layout.md-alignment-center
    card(
      v-for="(sensor, index) in sensors"
      :sensor="sensor"
      :show-data="showData"
      :key="index"
    )
    bus-card(
      from="19021323:2"
      title="UiT South"
    )
    bus-card(
      from="19021323:1"
      title="UiT North"
    )
</template>

<script>
import Reloader from '@/components/Reloader'
import Card from '@/components/Card'
import BusCard from '@/components/BusCard'

export default {
  name: 'Dashboard',
  components: {
    Reloader,
    Card,
    BusCard
  },
  data: () => ({
    timeout: null,
    showData: true
  }),
  computed: {
    sensors () {
      return this.$store.getters['App/sensors']
    }
  },
  methods: {
    toggleData () {
      this.showData = this.showData ? false : true
    }
  },
  mounted () {
    //this.timeout = setInterval(this.toggleData, 15 * 1000)
  },
  beforeDestroy () {
    clearInterval(this.toggleData)
  }
}
</script>

<style lang="scss" scoped>
#dashboard {
  .md-display-3 {
    padding-bottom: 20px;
    display: block;

    .right {
      padding-top: 23px;
      float: right;

      img {
        height: 25px;
        margin: 0 20px 0 20px;
        border: 0;
        float: right;

        &.airbit {
          margin: 0 0 0 20px;
        }
      }
    }

    .c {
      clear: both;
    }
  }

  .md-layout-item {
    padding: 0 20px 20px 0;
  }
}
</style>
