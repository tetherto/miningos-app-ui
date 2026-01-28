/**
 * Container utilities - main export file
 *
 * This module has been refactored from a single 814-line file into smaller,
 * more maintainable modules organized by functionality:
 * - types.ts: Type definitions
 * - containerTypes.ts: Type checking functions
 * - containerPdu.ts: PDU-related functions
 * - containerAlarms.ts: Alarm-related functions
 * - containerFormatters.ts: Name formatting functions
 * - containerHelpers.ts: Misc helper functions
 */

// Re-export all types
export type * from './types'

// Re-export container type checkers
export {
  isA1346,
  isAntminerContainer,
  isAntspaceHydro,
  isAntspaceImmersion,
  isAvalonContainer,
  isBitdeer,
  isBitmainImmersion,
  isContainerControlNotsupported,
  isContainerOffline,
  isM30,
  isMicroBT,
  isMicroBTKehua,
  isS19XP,
  isWhatsminerContainer,
} from './containerTypes'

// Re-export PDU functions and types
export {
  getAntspaceHydroIndexes,
  getAntspaceImmersionIndexes,
  getBitdeerIndexes,
  getConnectedMinerForSocket,
  getContainerMinersPosition,
  getContainerPduData,
  getContainerSettingsModel,
  getIndexes,
  getMicroBTIndexes,
  getMockedPduData,
  getNumberSelected,
  getPduData,
  getTotalContainerSockets,
  getTotalSockets,
} from './containerPdu'

export type { PduSocket } from './containerPdu'

// Re-export alarm functions
export {
  ANTSPACE_ALARM_STATUS,
  getAntspaceAlarms,
  getAntspaceFaultAlarmStatus,
  getAntspaceImmersionAlarms,
  getMicroBTAlarms,
} from './containerAlarms'

export type {
  AntspaceAlarmStatus,
  ContainerSpecificStats,
  MicroBTContainerStats,
} from './containerAlarms'

// Re-export formatter functions
export {
  getContainerName,
  getDetailedDeviceName,
  getDeviceContainerPosText,
  getDeviceName,
  getMinerTypeFromContainerType,
  getSupportedContainerTypesFromMinerType,
} from './containerFormatters'

// Re-export helper functions
export { getContainerParamsSettingList, naturalSorting, sortAlphanumeric } from './containerHelpers'
