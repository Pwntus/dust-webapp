import Vue from 'vue'

const bus = new Vue()

Vue.mixin({
  data: () => ({
    bus
  }),
  methods: {
    showSnackbar (message = null) {
      this.bus.$emit('mic:snackbar', message)
    }
  }
})
