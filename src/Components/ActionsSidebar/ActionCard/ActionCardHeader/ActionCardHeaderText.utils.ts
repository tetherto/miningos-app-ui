import { join as _join } from 'lodash'

export interface DeviceCall {
  id: string
  code?: string
}

export interface ActionTargets {
  [key: string]: {
    calls: DeviceCall[]
  }
}

/**
 * Extract device calls from codesList, targets, or tags
 * Priority: codesList > targets > sizeTags (fallback)
 *
 * @param codesList - Optional list of device codes
 * @param targets - Optional targets object with calls
 * @param sizeTags - Fallback size from tags
 * @returns Array of device objects with code/id
 */
export const getDevices = (
  codesList?: string[],
  targets?: ActionTargets,
  sizeTags?: number,
): DeviceCall[] => {
  if (codesList && codesList.length > 0) {
    return codesList.map((code) => ({ id: code, code }))
  }

  if (targets) {
    return Object.values(targets).flatMap((target) => target.calls || [])
  }

  // Return empty array with length matching sizeTags for fallback
  return Array(sizeTags || 0).fill({ id: '', code: '' })
}

/**
 * Get comma-separated device codes from devices array
 * Filters out empty values and joins with ', '
 *
 * @param devices - Array of device objects
 * @returns Comma-separated string of device codes
 */
export const getDeviceCodes = (devices: DeviceCall[]): string => {
  const codes = devices.map((device) => device.code || device.id).filter(Boolean)
  return _join(codes, ', ')
}
