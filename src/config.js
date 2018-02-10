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
