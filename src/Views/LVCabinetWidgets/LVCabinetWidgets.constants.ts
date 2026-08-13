/**
 * Constants for LV Cabinet Widgets
 */

/**
 * Paths for accessing nested device properties using lodash get
 */
export const DEVICE_PATHS = {
  ROOT_TEMP_SENSOR: ['rootTempSensor'],
  POWER_METER_STATS: ['last', 'snap', 'stats'],
  POWER_W: ['last', 'snap', 'stats', 'power_w'],
} as const
