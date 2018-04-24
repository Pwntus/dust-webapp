<template lang="pug">
.bus-card.md-layout-item.md-size-33.md-medium-size-50.md-small-size-100.md-xsmall-size-100
  md-card
    md-card-header
      md-card-header-text
        .md-title
          | {{ title }}
          .type
            | Bus Departures
            md-icon directions_bus
        .md-subhead Live
    md-card-content
      md-list.md-dense
        md-list-item(
          v-for="(bus, index) in filtered"
          :key="index"
        )
          md-avatar.md-avatar-icon.md-primary {{ bus.l }}
          .md-list-item-text
            span {{ bus.nd }}
          .md-list-action
            span {{ bus.a2moment }}
</template>

<script>
import moment from 'moment'
import parse from 'xml-parser'

export default {
  name: 'BusCard',
  props: ['from', 'title'],
  data: () => ({
    timeout: null,
    timeout_countdown: null,
    filtered: []
  }),
  computed: {
    endpoint () {
      return `http://rp.tromskortet.no/scripts/TravelMagic/TravelMagicWE.dll/v1DepartureSearchXML?from=${encodeURIComponent(this.from)}&realtime=1`
    }
  },
  methods: {
    poll () {
      fetch(this.endpoint, { mode: "no-cors" })
        .then(res => {
          for (var key of res.headers.keys()) {
            console.log(key + ":", res.headers.get(k));
          }
          return res.text()
        })
        .then(res => {
          try {
            let raw = parse(res)
            this.filtered = raw.root.children[0].children.map(item => {
              item.attributes.a2moment = null
              return {...item.attributes}
            })
            .slice(0, 8)

          } catch (e) {
            console.error(e)
          }
        })
        .catch(err => {
          console.error("fetch() failed:", this.endpoint, err)
        })
    },
    update_moment () {
      this.filtered = this.filtered.map(bus => {
        let a = bus.hasOwnProperty('a2') ? bus.a2 : bus.a
        bus.a2moment = moment(a, 'DD.MM.YYYY HH:mm:ss').fromNow()

        return bus
      })
    }
  },
  mounted () {
    this.poll()
    this.timeout = setInterval(() => {
      this.poll()
    }, 30000)
    this.timeout_countdown = setInterval(() => {
      this.update_moment()
    }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.timeout)
    clearInterval(this.timeout_countdown)
  }
}
</script>

<style lang="scss">
.bus-card {
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

      .md-list-item {
        margin-bottom: 3px;

        .md-list-item-content {
          padding-left: 0;
          font-size: 16px !important;

          .md-list-item-text span {
            font-size: 16px;
          }

          .md-avatar {
            border: 2px solid #1a5fd2;
            font-size: 16px;
          }

          .md-list-action {
            color: #dcb000;
          }
        }
      }
    }
  }
}
</style>
