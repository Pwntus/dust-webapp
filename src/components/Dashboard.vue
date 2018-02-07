<template lang="pug">
#dashboard
  span.md-display-3
    a(
      href="http://airbit.uit.no/"
      target="_new"
    )
      img(src="../assets/img/airbit-logo.png")
    | Dust Levels at IFI
    .right
      | Powered By:
      a(
        href="https://startiot.telenor.com/"
        target="_new"
      )
        img(src="../assets/img/startiot-logo.png")
    br.c
  .md-layout.md-alignment-center
    .md-layout-item.md-size-33.md-medium-size-100.md-small-size-100.md-xsmall-size-100(
      v-for="(data, index) in sensors"
      :index="index"
    )
      graph(
        :thingName="index"
        :data="data"
      )
</template>

<script>
import Graph from '@/components/Graph'

export default {
  name: 'Dashboard',
  components: {
    Graph
  },
  data: () => ({
    proc: null,
    timeout: null
  }),
  computed: {
    names () {
      return this.$store.getters['App/names']
    },
    sensors () {
      return this.$store.getters['App/sensors']
    }
  },
  watch: {
    names: function (names) {
      this.proc()
    }
  },
  mounted () {
    this.proc = async () => {
      for (let thing in this.names) {
        try {
          var res = await this.$store.dispatch('App/getHistogram', thing)
        } catch (e) {
          console.log(e)
        }
      }
    }

    this.timeout = setInterval(this.proc, 15 * 60 * 1000)
  },
  beforeDestroy () {
    clearInterval(this.timeout)
  }
}
</script>

<style lang="scss" scoped>
#dashboard {
  .md-display-3 {
    padding-bottom: 20px;
    display: block;

    img {
      height: 53px;
      margin-right: 20px;
      border: 0;
      float: left;
    }

    .right {
      padding-top: 17px;
      font-size: 15px;
      color: #000;
      font-weight: 500;
      float: right;

      img {
        height: 36px;
        margin: 0 20px 0 10px;
        float: right;
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
