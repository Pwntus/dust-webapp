<template></template>
<script>
import { REFRESH_HIST } from '@/config'

export default {
  name: 'Reloader',
  data: () => ({
    proc: null,
    timeout: null
  }),
  computed: {
    names () { return this.$store.getters['App/names'] }
  },
  watch: {
    names: function () { this.proc() }
  },
  created () {
    this.proc = async () => {
      for (let thing in this.names) {
        try {
          await this.$store.dispatch('App/getHistogram', thing)
        } catch (e) {
          console.log(e)
        }
      }
    }
    this.timeout = setInterval(this.proc, REFRESH_HIST)
  },
  beforeDestroy () { clearInterval(this.timeout) }
}
</script>
