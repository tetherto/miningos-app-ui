import type { SettingsExportData } from './types'

export const validateSettingsJson = (data: unknown): data is SettingsExportData => {
  if (!data || typeof data !== 'object') {
    return false
  }

  const settingsData = data as Record<string, unknown>

  // Check if it has at least one of the expected properties
  const hasValidStructure =
    'headerControls' in settingsData ||
    'featureFlags' in settingsData ||
    'timestamp' in settingsData

  return hasValidStructure
}

export const parseSettingsFile = async (file: File): Promise<SettingsExportData> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const data = JSON.parse(text)

        if (!validateSettingsJson(data)) {
          reject(
            new Error(
              'Invalid settings file format. Please ensure the file is a valid MiningOS settings export.',
            ),
          )
          return
        }

        resolve(data as SettingsExportData)
      } catch {
        reject(new Error('Failed to parse JSON file. Please ensure the file is valid JSON.'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file.'))
    }

    reader.readAsText(file)
  })
