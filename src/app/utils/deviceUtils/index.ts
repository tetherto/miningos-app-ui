/**
 * Device utilities - main export file
 *
 * This module has been refactored from a single 638-line file into smaller,
 * more maintainable modules organized by functionality.
 */

// Re-export all types
export type * from './types'

// Re-export device data accessors
export {
  separateByHyphenRegExp,
  separateByTwoHyphensRegExp,
  getLast,
  getSnap,
  getStats,
  getConfig,
  getContainerSpecificStats,
  getContainerSpecificConfig,
  getDeviceData,
} from './deviceData'

// Re-export device type checkers
export {
  isMiner,
  isPowerMeter,
  isTempSensor,
  isCabinet,
  isElectricity,
  isContainer,
  isSparePart,
  isAvalon,
  isWhatsminer,
  isAntminer,
  isS21SeriesAntminer,
  isMinerOffline,
  isTransformerPowermeter,
  isLVCabinet,
  isTransformerCabinet,
  getIsTransformerTempSensor,
  isContainerTag,
  checkIsIdTag,
  getDeviceModel,
} from './deviceTypes'

// Re-export device formatters
export {
  getHashrateUnit,
  formatPowerConsumption,
  formatEnergyConsumption,
  getHashrateString,
  getConsumptionString,
  megaToTera,
  unitToKilo,
} from './deviceFormatters'

// Re-export device helpers
export {
  getReportMiningData,
  getReportUteEnergy,
  getEfficiencyStat,
  getReportAggrRangeOf,
  getReportWebappHashrateStat,
  getSupportedPowerModes,
  getOnOffText,
  removeIdPrefix,
  appendIdToTags,
  appendIdToTag,
  appendContainerToTag,
  removeContainerPrefix,
  getPowerModeColor,
  getIsMinerPowerReadingAvailable,
  getMinerName,
  getMinerShortCode,
  getTemperatureColor,
  getTempSensorPosTag,
  getDeviceTemperature,
  isDeviceTagPresent,
  isDeviceSelected,
  getLegendLabelText,
  getTooltipText,
  navigateToDevice,
  getPoolAndWorkerNameFromUsername,
  getRackNameFromId,
  getDeviceDataByType,
  getTemperatureSensorName,
  getRootPowerMeter,
  getRootTempSensor,
  getTransformerTempSensor,
  getRootPowerMeterPowerValue,
  getRootTempSensorTempValue,
  getRootTransformerTempSensorTempValue,
  getIds,
  getLvCabinetTitle,
  getTransformerCabinetTitle,
  getCabinetTitle,
  getPowerSensorName,
  getCabinetPos,
  getLvCabinetTempSensorColor,
  getLvCabinetTransformerTempSensorColor,
  getTempSensorColor,
} from './deviceHelpers'
