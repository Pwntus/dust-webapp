<template lang="pug">
#dashboard
  span.md-display-3
    | Dust Levels at IFI
    .right
      a(
        href="https://startiot.telenor.com/"
        target="_new"
      )
        img(src="../assets/img/startiot-logo.png")
      a(
        href="http://airbit.uit.no/"
        target="_new"
      )
        img.airbit(src="../assets/img/airbit-logo.png")
    br.c
  .md-layout.md-alignment-center
    .md-layout-item.md-size-33.md-medium-size-50.md-small-size-100.md-xsmall-size-100(
      v-for="(data, index) in sensors"
      :index="index"
    )
      card(
        :thing-name="index"
        :show-hist="showHist"
        :data="data"
      )
</template>

<script>
import Card from '@/components/Card'

export default {
  name: 'Dashboard',
  components: {
    Card
  },
  data: () => ({
    proc: null,
    timeout: null,
    timeoutHist: null,
    showHist: 0
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
  methods: {
    toggleHist () {
      this.showHist = this.showHist > 0 ? 0 : 1
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
    this.timeoutHist = setInterval(this.toggleHist, 15 * 1000)
  },
  beforeDestroy () {
    clearInterval(this.timeout)
    clearInterval(this.timeoutHist)
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
        height: 35px;
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
