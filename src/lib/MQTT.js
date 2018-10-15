import AWSMqtt from 'aws-mqtt-client'
import { Auth } from 'aws-amplify'
import { TOPIC } from '@/config'

class MqttClient {
  async init (ctx) {
    this.ctx = ctx
    this.topic = null
    this.retries = 0

    try {
      const credentials = await Auth.currentCredentials()

      this.mqtt = new AWSMqtt({
        region:                 process.env.VUE_APP_AWS_REGION,
        accessKeyId:            credentials.accessKeyId,
        secretAccessKey:        credentials.secretAccessKey,
        sessionToken:           credentials.sessionToken,
        endpointAddress:        process.env.VUE_APP_AWS_IOT_ENDPOINT,
        maximumReconnectTimeMs: 8000,
        protocol:               'wss'
      })
      
      this.mqtt.on('reconnect', () => this.reconnect())
      this.mqtt.on('connect',   () => this.connect())
      this.mqtt.on('message',   (topic, message) => this.message(topic, message))
    } catch (e) {
      console.log('ERROR', e)
    }
  }

  reconnect () {
    this.retries++
    if (this.retries >= 2) {
      this.retries = 0
      this.kill()
    }
  }

  connect () {
    this.subscribe(TOPIC)
  }

  subscribe (topic) {
    if (this.topic !== null)
      this.mqtt.unsubscribe(this.topic)

    this.topic = topic
    this.mqtt.subscribe(topic, {qos: 1}, (err, granted) => {
      if (err)
        console.log(err)
    })
  }

  message (topic, message) {
    console.log(topic, message.toString('utf-8'))
    this.ctx.$store.dispatch('App/message', {
      topic: topic,
      message: message.toString('utf-8')
    })
  }

  kill () {
    if (this.topic !== null)
      this.mqtt.unsubscribe(this.topic)
    this.mqtt.end(true)
    this.init(this.ctx)
  }
}

export let MQTT = new MqttClient()
