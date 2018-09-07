<template lang="pug">
.td-card.md-layout-item.md-size-33.md-medium-size-50.md-small-size-100.md-xsmall-size-100(:class="{ 'fullscreen' : fullscreen }")
  md-card
    md-card-header
      md-card-header-text
        .md-title
          | Tromsøstudentenes Dataforening
          .type
            | Upcoming Events
            md-icon event_note
        .md-subhead
          a(
            href="https://www.td.org.uit.no/"
            target="_new"
          ) www.td.org.uit.no
    md-card-content
      md-list.md-dense.md-double-line
        md-list-item(
          v-for="(event, index) in data"
          :key="index"
          :href="link(event)"
          target="_new"
        )
          md-avatar
            b {{ month(event) }}
            span {{ day(event) }}
          .md-list-item-text
            span
              | {{ event.name }}
            span {{ place(event) }}
          .md-list-action
            span {{ start_time_ugly(event) }}
            br
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
  props: ['fullscreen'],
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
      return  moment(event.start_time).calendar(null, { sameElse: 'D.M.YYYY [at] HH:mm' })
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
            : 1;
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
.td-card
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

  .md-card
    overflow hidden

    .md-card-header
      padding-bottom 0
      background #FFF
      
      .md-title
        margin-top 0 !important
      
      a
        color #000

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

          .md-avatar
            height unset
            font-size 20px
            display unset
            text-align center
            border-radius 0
            
            b, span
              font-weight 100
              display block
            
            b
              font-size 13px
              color #FF0000

          .md-list-action
            color #dcb000
            text-align right
</style>
