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
    v-layout
      v-flex.mr-2.next-event(
        xs6
        v-if="nextEvent !== null"
      )
        v-img.mb-2(
          :src="nextEventCover"
          height="100"
        )
        .headline {{ nextEvent.name }}
        .caption.my-2
          .fade
          | {{ nextEvent.description }}
        .body-2.mt-3 {{ day(nextEvent) }} {{ month(nextEvent) }}. {{ nextEvent.place.name }}
      v-flex(
        xs6
        :xs12="nextEvent === null"
      )
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
    nextEvent: null,
    nextEventCover: undefined,
    timeout: null,
    timeoutEvent: null,
    n: 0
  }),
  computed: {
    endpoint () {
      return `https://graph.facebook.com/v3.1/tromsodataforening/events?access_token=${encodeURIComponent(FB_ACCESS_TOKEN)}`
    },
    eventCoverEndpoint () {
      return `https://graph.facebook.com/v3.1/${this.nextEvent.id}?fields=cover&access_token=${encodeURIComponent(FB_ACCESS_TOKEN)}`
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

        // this.setNextEvent()
      } catch (e) {
        // eslint-disable-next-line
        console.error(e)
      }
    },
    async setNextEvent () {
      if (this.data.length <= 0)
        return
      this.nextEvent = this.data[this.n]

      try {
        let response = await fetch(this.eventCoverEndpoint)
        let { cover } = await response.json()
        this.nextEventCover = cover.source
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
    this.timeoutEvent = setInterval(() => {
      this.n = this.n >= this.data.length ? 0 : this.n + 1
      this.setNextEvent()
    }, 15000)
  },
  beforeDestroy () {
    clearInterval(this.timeout)
  }
}
</script>

<style lang="stylus">
.card.td
  .v-card__text > .layout
    position absolute
    top 16px
    bottom 0
    right 16px

  .next-event
    .caption
      position relative
      text-overflow ellipsis
      overflow hidden
      height 40%

      .fade
        position absolute
        top 0
        bottom 0
        right 0
        left 0
        background-image linear-gradient(to top, #FFF, rgba(0,0,0,0), rgba(0,0,0,0))

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
