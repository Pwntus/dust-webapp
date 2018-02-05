<template lang="pug">
#app
  listener
  login(v-if="!auth")
  dashboard(v-if="auth")
</template>

<script>
import Listener from '@/components/Listener'
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'

export default {
  name: 'App',
  components: {
    Listener,
    Login,
    Dashboard
  },
  computed: {
    auth () {
      return this.$store.getters['App/auth']
    }
  }
}
</script>

<style lang="scss">
#app {
  height: 100%;
  padding: 20px 0 0 20px;
}
</style>
