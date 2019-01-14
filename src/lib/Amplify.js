import API from '@aws-amplify/api'
import Auth from '@aws-amplify/auth'
import { Logger } from '@aws-amplify/core'

Logger.LOG_LEVEL = process.env.NODE_ENV === 'development'
  ? 'INFO'
  : 'ERROR'

API.configure({
  API: {
    endpoints: [
      {
        name: process.env.VUE_APP_API_NAME,
        endpoint: process.env.VUE_APP_AWS_API_ENDPOINT,
        region: process.env.VUE_APP_AWS_REGION,
        custom_header: async () => {
          return {
            Authorization: (await Auth.currentSession()).idToken.jwtToken,
            identityId: (await Auth.currentCredentials())._identityId,
            'x-api-key': process.env.VUE_APP_AWS_API_KEY
          }
        }
      }
    ]
  }
})
Auth.configure({
  Auth: {
    identityPoolId: process.env.VUE_APP_AWS_IDENTITY_POOL_ID,
    region: process.env.VUE_APP_AWS_REGION,
    userPoolId: process.env.VUE_APP_AWS_USER_POOL_ID,
    userPoolWebClientId: process.env.VUE_APP_AWS_WEB_CLIENT_ID
  }
})
