/**
 * Type definitions for container utilities
 */

export interface AlarmItem {
  label: string
  id: string
  status: string
  severity?: 'critical' | 'warning' | 'info'
  createdAt?: string
  name?: string
  description?: string
  message?: string
}

export interface ContainerParamsSetting {
  label: string
  description: string
  highlightColor: string
  isFlashing: boolean
  isSuperflashing: boolean
}

export interface ContainerParamsOptions {
  unit?: string
  getHighlightColor?: (value: number) => string
  getIsFlashing?: (value: number) => boolean
  getIsSuperflashing?: (value: number) => boolean
}

export interface SocketSelection {
  nContainers: number
  nSockets: number
}
