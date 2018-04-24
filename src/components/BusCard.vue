<template lang="pug">
.card.md-layout-item.md-size-33.md-medium-size-50.md-small-size-100.md-xsmall-size-100
  md-card
    md-card-header
      md-card-header-text
        .md-title
          | {{ from }}
          .type
            | Bus Departures
            md-icon directions_bus
        .md-subhead Real Time
    md-card-content
      
</template>

<script>
import convert from 'xml-js'

export default {
  name: 'BusCard',
  props: ['from'],
  data: () => ({
    timeout: null
  }),
  computed: {
    endpoint () {
      return `http://localhost:3000/${this.from}`
    }
  },
  methods: {
    poll () {
      fetch(this.endpoint)
        //.then(res => convert.xml2json(res.text(), { compact: true }))
        .then(res => res.text())
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted () {
    this.timeout = setInterval(() => {
      this.poll()
    }, 30000)
  },
  beforeDestroy () {
    clearInterval(this.timeout)
  }
}
</script>

<style lang="scss" scoped>
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
}
</style>
