<template lang="pug">
.bus-card.md-layout-item.md-size-33.md-medium-size-50.md-small-size-100.md-xsmall-size-100(:class="{ 'fullscreen' : fullscreen }")
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
          :class="{ gone : has_gone(bus) }"
        )
          md-avatar.md-avatar-icon.md-primary {{ bus.l }}
          .md-list-item-text
            span
              | {{ bus.nd }}
              b {{ bus.late }}
          .md-list-action
            span {{ bus.live_moment }}
            br
            span {{ bus.sched_time }}
</template>

<script>
import moment from 'moment'
import parse from 'xml-parser'

const TRAVEL_MAGIC_DATE_FORMAT = 'DD.MM.YYYY HH:mm:ss'

export default {
  name: 'BusCard',
  props: ['from', 'title', 'fullscreen'],
  data: () => ({
    timeout: null,
    timeout_countdown: null,
    diff: 0,
    filtered: []
  }),
  computed: {
    endpoint () {
      return `http://startiot.cs.uit.no:3003/${this.from}`
    },
    now () {
      return moment().add(this.diff)
    }
  },
  methods: {
    get_sched_time (bus) {
      if (bus.hasOwnProperty('a2'))
        return 'exp. ' + bus.a2.format('HH:mm')
      else if (bus.hasOwnProperty('d2'))
        return 'exp. ' + bus.d2.format('HH:mm')
      return ''
    },
    get_live_moment (bus) {
      if (bus.hasOwnProperty('a2'))
        return bus.a2.from(this.now)
      else if (bus.hasOwnProperty('a'))
        return bus.a.format('[sched.] HH:mm')
      else if (bus.hasOwnProperty('d2'))
        return bus.d2.from(this.now)
      else if (bus.hasOwnProperty('d'))
        return bus.d.format('[sched.] HH:mm')
      else
        return 'No info'
    },
    get_late (bus) {
      let diff = 0

      if (bus.hasOwnProperty('a2') && bus.hasOwnProperty('a'))
        diff = moment.duration(bus.a2.diff(bus.a)).asMinutes()
      else if (bus.hasOwnProperty('d2') && bus.hasOwnProperty('d'))
        diff = moment.duration(bus.d2.diff(bus.d)).asMinutes()

      return diff > 1 ? `${Math.round(diff)}'` : null
    },
    has_gone (bus) {
      if (bus.hasOwnProperty('a2') && bus.hasOwnProperty('a'))
        return this.now.diff(bus.a2) > 0
      else if (bus.hasOwnProperty('d2') && bus.hasOwnProperty('d'))
        return this.now.diff(bus.d2) > 0
      else
        return false
    },
    poll () {
      fetch(this.endpoint)
        .then(res => {
          let proxy = moment(res.headers.get('Date'))
          this.diff = moment().diff(proxy)

          return res.text()
        })
        .then(res => {
          try {
            let raw = parse(res)
            this.filtered = raw.root.children[0].children.map(item => {
              let bus = item.attributes

              // Convert properties to moments
              if (bus.hasOwnProperty('a'))
                bus.a = moment(bus.a, TRAVEL_MAGIC_DATE_FORMAT)
              if (bus.hasOwnProperty('a2'))
                bus.a2 = moment(bus.a2, TRAVEL_MAGIC_DATE_FORMAT)
              if (bus.hasOwnProperty('d'))
                bus.d = moment(bus.d, TRAVEL_MAGIC_DATE_FORMAT)
              if (bus.hasOwnProperty('d2'))
                bus.d2 = moment(bus.d2, TRAVEL_MAGIC_DATE_FORMAT)

              // Add own properties
              bus.live_moment = this.get_live_moment(bus)
              bus.late = this.get_late(bus)
              bus.sched_time = this.get_sched_time(bus)

              return {...bus}
            })

            if (this.fullscreen === false) {
              this.filtered = this.filtered.slice(0, 8)
            }

          } catch (e) {
            return
          }
        })
        .catch(() => {
          return
        })
    },
    update_moment () {
      this.filtered = this.filtered.map(bus => {
        bus.live_moment = this.get_live_moment(bus)
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

<style lang="stylus">
.bus-card
  &.fullscreen
    .md-card
      position fixed
      top 15px
      bottom 15px
      left 15px
      right 15px
      
      .md-card-content
        height 100%
        overflow auto

  .gone
    opacity .5

  .md-card
    overflow hidden

    .md-card-header
      padding-bottom 0
      background #FFF
      
      .md-title
        margin-top 0 !important

      .type
        font-size 12px
        font-weight 500
        line-height 28px
        color rgba(0, 0, 0, .7)
        float right

        .md-icon
          margin-left 10px
          font-size 18px
          float right

    .md-card-content
      height 385px
      overflow hidden

      .md-list-item
        margin-bottom 3px

        .md-list-item-content
          padding-left 0
          font-size 16px !important

          .md-list-item-text span
            font-size 16px

            b
              padding-left 10px
              color #ff504a
              font-size 16px
              font-weight normal

          .md-avatar
            border 2px solid #1a5fd2
            font-size 16px

          .md-list-action
            color #dcb000
            text-align right
</style>
