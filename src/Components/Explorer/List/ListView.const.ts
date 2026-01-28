export const FieldsPaths = {
  online: ['last.snap.config.suspended'],
  temperature: ['last.snap.stats.temperature_c.max', 'last.snap.stats.ambient_temp_c'],
  temperatureAmbient: ['last.snap.stats.ambient_temp_c'],
  hashrate: ['last.snap.stats.hashrate_mhs.avg'],
  id: ['id'],
  status: ['last.snap.stats.status'],
  model: ['info.container'],
  error: ['last.snap.stats.status'],
  humidity: ['last.snap.stats.humidity_percent'],
  consumption: ['last.snap.stats.power_w'],
  poolHashrate: ['last.snap.stats.hashrate'],
  revenue: ['last.snap.stats.revenue_24h'],
  activeWorkersCount: ['last.snap.stats.active_workers_count'],
  powerMode: ['last.snap.config.power_mode'],
  ip: ['address'],
  position: ['info.pos'],
  ledStatus: ['last.snap.config.led_status'],
}

export const TAB = 'tab'

export const ERROR_MESSAGES = {
  ERR_THING_CONNECTION_FAILURE: 'No Connection',
}

export const DEFAULT_PAGINATION_SIZE = 20
export const CONTAINER_DEFAULT_PAGINATION_SIZE = 50
export const LOADING_DELAY_MS = 300
