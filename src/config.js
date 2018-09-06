export const REFRESH_HIST  = 15 * 60 * 1000
export const DEFAULT_FRAME = 'hour'
export const TOPIC         = 'thing-update/dust/#'
export const THING_TYPE    = 490
export const COLORS        = ['#6ee86e', '#ff9900', '#ff0000', '#990099']
export const THRESHOLDS    = {
  pm25: {
    day:  [15, 25, 75],  // > 75
    hour: [25, 40, 150]  // > 150
  },
  pm10: {
    day:  [30, 50, 150], // > 150
    hour: [50, 80, 400]  // > 400
  }
};

// This is needed to get the dust widgets to work
// eslint-disable-next-line
export const MIC_USERNAME = process.env.VUE_APP_MIC_USERNAME || null
// eslint-disable-next-line
export const MIC_PASSWORD = process.env.VUE_APP_MIC_PASSWORD || null

// eslint-disable-next-line
export const FB_ACCESS_TOKEN = process.env.VUE_APP_FB_ACCESS_TOKEN || null
export const FB_TIMEOUT = 3600000
