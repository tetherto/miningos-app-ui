import type { SettingsExportData } from './types'

export const exportSettingsToFile = (data: SettingsExportData) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `miningos-settings-${timestamp}.json`

  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  // Clean up
  URL.revokeObjectURL(url)

  return filename
}
