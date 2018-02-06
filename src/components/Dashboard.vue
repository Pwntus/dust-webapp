<template lang="pug">
#dashboard
  span.md-display-3 Dust Levels at IFI
  .md-layout.md-alignment-center
    .md-layout-item.md-size-33.md-medium-size-100.md-small-size-100.md-xsmall-size-100(
      v-for="(data, index) in sensors"
      :index="index"
    )
      graph(:data="data")
</template>

<script>
import Graph from '@/components/Graph'

export default {
  name: 'Dashboard',
  components: {
    Graph
  },
  computed: {
    sensors () {
      return this.$store.getters['App/sensors']
    }
  }
}
</script>

<style lang="scss" scoped>
#dashboard {
  .md-display-3 {
    padding-bottom: 20px;
    display: block;
  }

  .md-layout-item {
    padding: 0 20px 20px 0;
  }
}
</style>
