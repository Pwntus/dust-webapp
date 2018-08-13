<template lang="pug">
#app
  listener
  login(v-if="!auth")
  router-view(v-if="auth")
</template>

<script>
import Listener from '@/components/Listener'
import Login from '@/components/Login'

export default {
  name: 'App',
  components: {
    Listener,
    Login
  },
  computed: {
    auth () {
      return this.$store.getters['App/auth']
    }
  }
}
</script>

<style lang="stylus">
#app
  height 100%
  padding 20px 0 0 20px
</style>
