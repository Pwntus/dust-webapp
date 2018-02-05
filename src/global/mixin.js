import Vue from 'vue'
import { mapGetters } from 'vuex'

const bus = new Vue()

Vue.mixin({
  data: () => ({
    bus
  }),
  computed: {
    ...mapGetters({
      auth: 'App/auth'
    })
  },
  methods: {
    showSnackbar (message = null) {
      this.bus.$emit('mic:snackbar', message)
    }
  }
})
