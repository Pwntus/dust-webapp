<template lang="pug">
.card.airport
  v-card-title
    .headline
      | {{ title }}
      .type
        | Airspace
        v-icon airplanemode_active
    .subheader Live
  v-card-text
    #map(ref="map")
</template>

<script>
/* eslint-disable */
import 'leaflet'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-geometryutil'
import 'leaflet-rotatedmarker'
import axios from 'axios'
import '@/lib/Leaflet.MovingMarker'

const PROXY = 'https://startiot.cs.uit.no:3004/'
const ICON = L.icon({
  iconUrl: require('../../assets/img/airplane-mode-on-symbol.png'),
  iconSize:     [20, 20], // size of the icon
  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
})

const kts2ms = (kts, distance) => {
  const mps = kts * 0.514444
  const s = distance / mps
  const ms = s * 1000
  return ms
}

export default {
  name: 'AirportCard',
  props: ['title', 'center', 'zoom'],
  data: () => ({
    map: null,
    featureGroup: null,
    traceGroup: null,
    poller: null,
    rawData: null,
    data: null
  }),
  computed: {
    getCenter () {
      const [ lat, lng ] = this.center.split(',')
      return new L.LatLng(lat, lng)
    },
    maxDistance () {
      const bounds = this.map.getBounds()
      return this.map.distance(bounds.getSouthWest(), bounds.getNorthEast())
    },
    layer () {
      return L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png')
    },
    flightRadarEndpoint () {
      const bounds = this.map.getBounds()
      const bbString = `${bounds.getNorth()},${bounds.getSouth()},${bounds.getWest()},${bounds.getEast()}`
      return `${PROXY}zones/fcgi/feed.js?bounds=${bbString}&faa=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=14400&gliders=1&stats=1`
    }
  },
  methods: {
    async poll () {
      try {
        let { data } = await axios(this.flightRadarEndpoint)
        delete data.full_count
        delete data.stats
        delete data.version
        this.rawData = data

        this.updateMap()
      } catch (e) {
        return
      }
    },
    updateMap () {
      let skip = []

      this.featureGroup.eachLayer(layer => {
        const id = layer._icon.id

        // Removed
        if (!this.rawData.hasOwnProperty(id)) {
          this.featureGroup.removeLayer(layer)
          return
        
        // Update existing
        } else {
          // Add ID to skip so that we don't add it again later
          skip.push(id)

          // Updated data
          const [ mode_s, lat, lng, track, alt, kts, squawk, radar,
              model, registration, timestamp, origin, destination,
              flightNumber, isGroundTraffic, verticalSpeed,
              icaoIdentifier, unknown, airlineIcao] = this.rawData[id]

          // Construct track path (a line)
          const start = [lat, lng]
          const end = L.GeometryUtil.destination(new L.LatLng(lat, lng), track, this.maxDistance)

          // Smoothly correct position
          layer.moveTo(start, 1000)
          layer.on('end', () => {
            this.featureGroup.removeLayer(layer)
            layer = L.Marker.movingMarker([start, end], kts2ms(kts, this.maxDistance), {
              autostart: true,
              rotationAngle: track,
              rotationOrigin: 'center',
              icon: ICON
            })
            .bindTooltip(`${origin} → ${destination}`, {
              permanent: true,
              direction: 'bottom',
              className: 'tooltip'
            })
            .addTo(this.featureGroup)

            // Add ID for further referencing
            layer._icon.id = id
          })
        }
      })

      let unique = []
      for (let id in this.rawData) {
        // Item already updated or duplicated
        if (skip.includes(id) || unique.includes(id)) {
          continue
        }

        unique.push(id)

          const [mode_s, lat, lng, track, alt, kts, squawk, radar,
              model, registration, timestamp, origin, destination,
              flightNumber, isGroundTraffic, verticalSpeed,
              icaoIdentifier, unknown, airlineIcao] = this.rawData[id]

        // Construct track path (a line)
        const start = [lat, lng]
        const end = L.GeometryUtil.destination(new L.LatLng(lat, lng), track, this.maxDistance)

        const movingMarker = L.Marker.movingMarker([start, end], kts2ms(kts, this.maxDistance), {
          autostart: true,
          rotationAngle: track,
          rotationOrigin: 'center',
          icon: ICON
        })
        .bindTooltip(`${origin} → ${destination}`, {
          permanent: true,
          direction: 'bottom',
          className: 'tooltip'
        })
        .addTo(this.featureGroup)

        // Add ID for further referencing
        movingMarker._icon.id = id
      }

      if (unique.length <= 20) {
        this.updatePaths()
      }
    },
    async updatePaths () {
      let traces = []
      for (let layer of this.featureGroup.getLayers()) {
        try {
          const id = layer._icon.id
          const { data } = await axios(`${PROXY}clickhandler/?version=1.5&flight=${id}`)
          traces.push(data.trail.map(t => [t.lat, t.lng]))
        } catch (e) {
          return
        }
      }

      // Update traces
      this.traceGroup.clearLayers()
      for (let trace of traces) {
        let polyline = L.polyline(trace, {
          weight: 2,
          color: '#448aff'
        })
        .addTo(this.traceGroup)
      }
    }
  },
  mounted () {
    // Init map
    this.map = L.map(this.$refs.map, {
      center: this.getCenter,
      zoom: this.zoom,
      layers: this.layer,
      attributionControl: false,
      zoomControl: false,
      dragging: true
    })

    // Create layer group representing aircrafts
    this.featureGroup = L.featureGroup().addTo(this.map)

    // Create layer group representing traces
    this.traceGroup = L.featureGroup().addTo(this.map)

    // Start FlightRadar24 polling
    this.poller = setInterval(() => {
      this.poll()
    }, 10000)
  },
  beforeDestroy () {
    clearInterval(this.poller)
  }
}
</script>

<style lang="stylus">
.card.airport
  .v-card__text
    height 100%
    overflow hidden
    padding 16px 0 0

    #map
      height 100%

      .leaflet-tooltip-top:before,
      .leaflet-tooltip-bottom:before,
      .leaflet-tooltip-left:before,
      .leaflet-tooltip-right:before
        border 0

      .tooltip
        box-shadow none
        margin-top 20px
        padding 2px 4px 0
        border 0
        font-family monospace
        font-size 9px
        background rgba(0, 0, 0, .5)
        color #FFF
</style>
