import type { HeaderPreferences } from '../HeaderControls/types'

export interface SettingsExportData {
  headerControls?: HeaderPreferences
  featureFlags?: Record<string, boolean>
  timestamp?: string
  version?: string
  [key: string]: unknown
}

export interface ImportResult {
  success: boolean
  applied?: string[]
  errors?: string[]
  message?: string
}
