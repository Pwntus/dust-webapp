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
    //- Left section
    .td-layout-left(
      v-if="showLeft"
    )
      v-img.mb-2(
        :src="nextEventCover"
        height="100"
      )
      .headline {{ name(nextEvent) }}
      .caption.my-2
        .fade
        | {{ description(nextEvent) }}
      .body-2.mt-3 {{ day(nextEvent) }} {{ month(nextEvent) }}. {{ placeName(nextEvent) }}

    //- Right section
    .td-layout-right(
      :class="{ 'half' : showLeft }"
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
            v-list-tile-title {{ name(event) }}
            v-list-tile-sub-title {{ placeName(event) }}
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
    timeout_event: null,
    timeout_countdown: null,
    n: 0
  }),
  computed: {
    endpoint () {
      return `https://graph.facebook.com/v3.1/tromsodataforening/events?access_token=${encodeURIComponent(FB_ACCESS_TOKEN)}`
    },
    eventCoverEndpoint () {
      try {
        return `https://graph.facebook.com/v3.1/${this.nextEvent.id}?fields=cover&access_token=${encodeURIComponent(FB_ACCESS_TOKEN)}`
      } catch (e) {
        return ''
      }
    },
    showLeft () {
      return this.$vuetify.breakpoint.lgAndUp
    }
  },
  methods: {
    day (event) {
      try {
        return moment(event.start_time).format('D')
      } catch (e) {
        return ''
      }
    },
    month (event) {
      try {
        return moment(event.start_time).format('MMM')
      } catch (e) {
        return ''
      }
    },
    link (event) {
      try {
        return `https://www.facebook.com/events/${event.id}`
      } catch (e) {
        return ''
      }
    },
    description (event) {
      try {
        return event.description
      } catch (e) {
        return ''
      }
    },
    name (event) {
      try {
        return event.name
      } catch (e) {
        return ''
      }
    },
    placeName (event) {
      try {
        return event.place.name
      } catch (e) {
        return ''
      }
    },
    start_time_ugly (event) {
      try {
        return moment(event.start_time).calendar(null, { sameElse: 'D.M.YYYY [at] HH:mm' })
      } catch (e) {
        return ''
      }
    },
    start_time (event) {
      try {
        return moment(event.start_time).fromNow()
      } catch (e) {
        return ''
      }
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

        this.setNextEvent()

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
    },
    update_moment () {
      try {
        this.data = this.data.slice()
      } catch (e) {}
    }
  },
  mounted () {
    this.poll()
    this.timeout = setInterval(() => {
      this.poll()
    }, FB_TIMEOUT)
    this.timeout_event = setInterval(() => {
      this.n = this.n >= this.data.length ? 0 : this.n + 1
      this.setNextEvent()
    }, 45000)
    this.timeout_countdown = setInterval(() => {
      this.update_moment()
    }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.timeout)
    clearInterval(this.timeout_event)
    clearInterval(this.timeout_countdown)
  }
}
</script>

<style lang="stylus">
.card.td
  .td-layout-left
    float left
    width 50%
    height 100%

    .caption.my-2
      max-height 40%
      position relative
      text-overflow ellipsis
      overflow hidden

      .fade
        position absolute
        top 0
        bottom 0
        right 0
        left 0
        background-image linear-gradient(to top, #FFF, rgba(0,0,0,0), rgba(0,0,0,0))

  .td-layout-right
    float left
    width 100%

    &.half
      width 50%

  .v-card__text
    position absolute
    top 72px
    bottom 0
    right 0
    left 0

  .v-list__tile__avatar
    .v-avatar
      margin-top -5px
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
