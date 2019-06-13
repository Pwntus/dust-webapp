<template lang="pug">
.card.bus
  v-card-title
    .headline
      a(
        :href="`http://rp.tromskortet.no/scripts/TravelMagic/TravelMagicWE.dll/avgangsinfo?context=wap.xhtml&dep1=1&now=1&from=${encodeURIComponent(from)}`"
        target="_new"
      ) {{ title }}
      .type
        | Bus Departures
        v-icon directions_bus
    .subheader Live
  v-card-text
    v-list(dense two-line)
      v-list-tile.unset-height(
        v-for="(bus, index) in filtered"
        :key="index"
        :class="{ gone : has_gone(bus) }"
        :href="`http://rp.tromskortet.no/scripts/TravelMagic/TravelMagicWE.dll/turinfo?context=wap.xhtml&dep1=1&now=1&trip=${encodeURIComponent(bus.tid)}&from=${encodeURIComponent(bus.v)}`"
        target="_new"
      )
        v-list-tile-avatar
          span.white--text {{ bus.l }}
        v-list-tile-content
          v-list-tile-title
            | {{ bus.nd }}
            b {{ bus.late }}
          v-list-tile-sub-title(v-if="bus.notes.length")
            .caption(
              v-for="(n, noteIndex) in bus.notes"
              :key="noteIndex"
            ) {{ n }}
        v-list-tile-action
          span {{ bus.live_moment }}
          span(v-if="bus.sched_time !== ''") {{ bus.sched_time }}
</template>

<script>
import moment from 'moment'
import parse from 'xml-parser'

const TRAVEL_MAGIC_DATE_FORMAT = 'DD.MM.YYYY HH:mm:ss'

export default {
  name: 'BusCard',
  props: ['from', 'title'],
  data: () => ({
    timeout: null,
    last_poll: +new Date(),
    diff: 0,
    filtered: []
  }),
  computed: {
    endpoint () {
      return `https://startiot.cs.uit.no:3003/${this.from}`
    },
    now () {
      return moment().add(this.diff)
    }
  },
  methods: {
    get_sched_time (bus) {
      if (bus.cancellation === 'true') {
        if (bus.hasOwnProperty('a'))
          return bus.a.format('HH:mm')
        else if (bus.hasOwnProperty('d'))
          return bus.d.format('HH:mm')
        return ''
      }
      if (bus.hasOwnProperty('a2') && this.now.diff(bus.a2) < 0)
        return 'est. ' + bus.a2.format('HH:mm')
      else if (bus.hasOwnProperty('d2'))
        return 'est. ' + bus.d2.format('HH:mm')
      return ''
    },
    get_live_moment (bus) {
      if (bus.cancellation === 'true')
        return 'Cancelled'
      if (bus.hasOwnProperty('a2') && this.now.diff(bus.a2) < 0)
        return bus.a2.from(this.now)
      else if (bus.hasOwnProperty('d2'))
        return bus.d2.from(this.now)
      else if (bus.hasOwnProperty('a'))
        return bus.a.format('[sched.] HH:mm')
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
      if (bus.hasOwnProperty('a2') && bus.hasOwnProperty('a') && this.now.diff(bus.a2) < 0)
        return false
      if (bus.hasOwnProperty('d2') && bus.hasOwnProperty('d'))
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
              let hasNotes = item.children.length > 0
              bus.notes = hasNotes
                ? item.children[0].children.map(child => child.attributes.d)
                : []

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

              return { ...bus }
            })
          } catch (e) {}
        })
        .catch(() => {})
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
      this.update_moment() // Refresh momentjs values

      // Check if need to poll (more than 15s since last)
      const unix = +new Date()
      if (unix - this.last_poll > 15000) {
        this.last_poll = unix
        this.poll()
      }
    }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.timeout)
  }
}
</script>

<style lang="stylus">
.card.bus
  .gone
    opacity .5

  .unset-height
    .v-list__tile
      height unset !important
</style>
