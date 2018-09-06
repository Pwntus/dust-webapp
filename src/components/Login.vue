<template lang="pug">
.md-layout.md-alignment-center
  md-progress-spinner.md-accent(
    md-mode="indeterminate"
    :md-diameter="100"
    v-if="!auth"
  )

  .md-layout-item.md-size-33.md-medium-size-33.md-small-size-50.md-xsmall-size-100(v-if="false")
    md-card
      md-card-header
        md-card-header-text
          .md-title Login
          .md-subhead Please provide your Managed IoT Cloud credentials to start using this tool
      md-card-content
        md-field
          label Username
          md-input(
            v-model="username"
            v-bind:disabled="loading"
            @keyup.enter.native="login"
          )
        md-field
          label Password
          md-input(
            type="password"
            v-model="password"
            v-bind:disabled="loading"
            @keyup.enter.native="login"
          )
      md-card-actions
        md-button.md-raised.md-primary(
          v-bind:disabled="loading"
          @click.native="login"
        )
          span Login
</template>

<script>
import { MIC_USERNAME, MIC_PASSWORD } from '@/config'

export default {
  name: 'Login',
  data: () => ({
    username: MIC_USERNAME,
    password: MIC_PASSWORD,
    loading: false
  }),
  computed: {
    payload () {
      return { username: this.username, password: this.password, ctx: this }
    },
    auth () {
      return this.$store.getters['App/auth']
    }
  },
  methods: {
    login () {
      if (this.username == '' || this.password == '') return
        
      this.loading = true
      this.$store.dispatch('App/auth', this.payload)
        .catch(() => {
          this.loading = false
        })
    }
  },
  mounted () {
    this.login()
  }
}
</script>

<style lang="stylus" scoped>
.md-layout
  padding 0 20px 20px 0

  .md-progress-spinner
    position absolute
    top 50%
    left 50%
    margin -50px 0 0 -50px
</style>
