<template lang="pug">
#dashboard
  reloader
  span.md-display-3
    | Dust Levels at IFI
    .right
      a(href="https://startiot.telenor.com/" target="_blank")
        img(src="../assets/img/startiot-logo.png")
      a(href="http://airbit.uit.no/" target="_blank")
        img.airbit(src="../assets/img/airbit-logo.png")
    .c
  .md-layout.md-alignment-center
    card(
      v-for="(sensor, index) in sensors"
      :sensor="sensor"
      :key="index"
    )
</template>

<script>
import Reloader from '@/components/Reloader'
import Card from '@/components/Card'

export default {
  name: 'Dashboard',
  components: {
    Reloader,
    Card
  },
  computed: {
    sensors () {
      return this.$store.getters['App/sensors']
    }
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
