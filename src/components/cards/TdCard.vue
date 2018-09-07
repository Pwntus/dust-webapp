<template lang="pug">
.card.td
  v-card-title
    .headline
      | Tromsøstudentenes Dataforening
      .type
        | Upcoming Events
        v-icon event_note
    .subheader
      a(
        href="https://www.td.org.uit.no/"
        target="_new"
      ) www.td.org.uit.no
  v-card-text
    v-list(dense two-line)
      v-list-tile(
        v-for="(event, index) in data"
        :key="index"
        :href="link(event)"
        target="_new"
      )
        v-list-tile-avatar
          b {{ month(event) }}
          span {{ day(event) }}
        v-list-tile-content
          v-list-tile-title {{ event.name }}
          v-list-tile-sub-title {{ place(event) }}
        v-list-tile-action
          span {{ start_time_ugly(event) }}
          span {{ start_time(event) }}
</template>

<script>
import moment from 'moment'

// eslint-disable-next-line
export const FB_ACCESS_TOKEN = process.env.VUE_APP_FB_ACCESS_TOKEN || null
export const FB_TIMEOUT = 3600000

moment.locale('en-gb')

export default {
  name: 'TdCard',
  data: () => ({
    data: [],
    timeout: null
  }),
  computed: {
    endpoint () {
      return `https://graph.facebook.com/v3.1/tromsodataforening/events?access_token=${encodeURIComponent(FB_ACCESS_TOKEN)}`
    }
  },
  methods: {
    day (event) {
      return moment(event.start_time).format('D')
    },
    month (event) {
      return moment(event.start_time).format('MMM')
    },
    link (event) {
      return `https://www.facebook.com/events/${event.id}`
    },
    place (event) {
      return event.hasOwnProperty('place') ? event.place.name : ''
    },
    start_time_ugly (event) {
      return moment(event.start_time).calendar(null, { sameElse: 'D.M.YYYY [at] HH:mm' })
    },
    start_time (event) {
      return moment(event.start_time).fromNow()
    },
    async poll () {
      try {
        let response = await fetch(this.endpoint)
        let { data } = await response.json()
        data.sort((a, b) => {
          let aStartTime = moment(a.start_time)
          let bStartTime = moment(b.start_time)
          return aStartTime.isBefore(bStartTime)
            ? -1
            : aStartTime.isSame(bStartTime) ? 0
              : 1
        })
        this.data = data.filter(e => {
          let today = moment().startOf('day')
          return moment(e.start_time).isSameOrAfter(today)
        })
      } catch (e) {
        // eslint-disable-next-line
        console.error(e)
      }
    }
  },
  mounted () {
    this.poll()
    this.timeout = setInterval(() => {
      this.poll()
    }, FB_TIMEOUT)
  },
  beforeDestroy () {
    clearInterval(this.timeout)
  }
}
</script>

<style lang="stylus">
.card.td
  .v-list__tile__avatar
    .v-avatar
      border 0 !important
      background transparent !important
      font-size 20px
      display unset
      border-radius 0

      b, span
        font-weight 400
        display block

      b
        font-weight 500
        font-size 13px
        color #FF0000
</style>
