<template lang="pug">
//- Title, only shown if at dashboard
.display-3(v-if="$route.path === '/'")
  | Environment at IFI
  .right
    a(href="https://startiot.telenor.com/" target="_blank")
      img(src="../assets/img/startiot-logo.png")
</template>

<script>
export default {
  name: 'DashboardTitle'
}
</script>

<style lang="stylus">
.display-3
  .right
    padding-top 23px
    float right

    img
      height 25px
      margin 0 20px 0 20px
      border 0
      float right
      &.airbit
        margin 0 0 0 20px
</style>
