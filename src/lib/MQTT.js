import Amplify from '@aws-amplify/core'
import Auth from '@aws-amplify/auth'
import PubSub from '@aws-amplify/pubsub'
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers'

class MqttClient {
  constructor () {
    // List containing active MQTT instances
    this.instances = []
  }

  /**
   * Attaches the current user credentials to the AWSIoTProvider so
   * the signed in user has the ability to recieve data from subscribed
   * MQTT Topics.
   *
   * Resolves a promise if the credentials were received and the Provider
   * was successfully attached to the amplify class.
   */
  async attachIotPolicy () {
    try {
      const credentials = await Auth.currentCredentials()
      Amplify.addPluggable(new AWSIoTProvider({
        aws_pubsub_region: process.env.VUE_APP_AWS_REGION,
        aws_pubsub_endpoint: `wss://${process.env.VUE_APP_AWS_IOT_ENDPOINT}/mqtt`,
        credentials
      }))
    } catch (e) {
      throw e
    }
  }

  /**
   * Subscribes to multiple MQTT Topics
   *
   * @param {array} topics an array of strings of the topics that are being subscribed to
   * @param {fn} messageHandler the handler that should be called when a message is received
   */
  async subscribe (topics, messageHandler) {
    try {
      await this.attachIotPolicy()
      PubSub.subscribe(topics).subscribe({
        next: data => {
          if (messageHandler)
            messageHandler(data)
        },
        // eslint-disable-next-line
        error: error => console.error(error),
        // eslint-disable-next-line
        close: () => console.log('Done')
      })
    } catch (e) {
      throw e
    }
  }

  kill () {
    for (let i in this.instances) {
      this.instances[i].unsubscribe()
      delete this.instances[i]
    }
  }
}

export let MQTT = new MqttClient()
