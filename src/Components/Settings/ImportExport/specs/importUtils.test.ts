import { describe, it, expect, vi } from 'vitest'

import { parseSettingsFile, validateSettingsJson } from '../importUtils'

describe('validateSettingsJson', () => {
  it('returns false for null input', () => {
    expect(validateSettingsJson(null)).toBe(false)
  })

  it('returns false for non-object input', () => {
    expect(validateSettingsJson('string')).toBe(false)
    expect(validateSettingsJson(42)).toBe(false)
    expect(validateSettingsJson(true)).toBe(false)
  })

  it('returns true when object has headerControls key', () => {
    expect(validateSettingsJson({ headerControls: {} })).toBe(true)
  })

  it('returns true when object has featureFlags key', () => {
    expect(validateSettingsJson({ featureFlags: {} })).toBe(true)
  })

  it('returns true when object has timestamp key', () => {
    expect(validateSettingsJson({ timestamp: '2024-01-01' })).toBe(true)
  })

  it('returns false when object has none of the expected keys', () => {
    expect(validateSettingsJson({ unknownKey: true })).toBe(false)
  })

  it('returns true when object has all expected keys', () => {
    expect(
      validateSettingsJson({
        headerControls: {},
        featureFlags: {},
        timestamp: '2024-01-01',
      }),
    ).toBe(true)
  })
})

describe('parseSettingsFile', () => {
  it('resolves with parsed valid settings JSON', async () => {
    const settingsData = { timestamp: '2024-01-01', headerControls: {} }
    const fileContent = JSON.stringify(settingsData)
    const mockFile = new File([fileContent], 'settings.json', { type: 'application/json' })

    const result = await parseSettingsFile(mockFile)
    expect(result).toEqual(settingsData)
  })

  it('rejects with invalid JSON format error when file has bad structure', async () => {
    const fileContent = JSON.stringify({ unknownKey: true })
    const mockFile = new File([fileContent], 'settings.json', { type: 'application/json' })

    await expect(parseSettingsFile(mockFile)).rejects.toThrow('Invalid settings file format')
  })

  it('rejects with JSON parse error for malformed JSON', async () => {
    const mockFile = new File(['{ invalid json '], 'settings.json', { type: 'application/json' })

    await expect(parseSettingsFile(mockFile)).rejects.toThrow('Failed to parse JSON file')
  })

  it('rejects when FileReader encounters an error', async () => {
    // Mock FileReader to simulate an error
    const originalFileReader = globalThis.FileReader
    class MockFileReaderError {
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null
      onerror: (() => void) | null = null
      readAsText() {
        setTimeout(() => {
          if (this.onerror) this.onerror()
        }, 0)
      }
    }
    globalThis.FileReader = MockFileReaderError as never

    const mockFile = new File(['test'], 'settings.json')
    await expect(parseSettingsFile(mockFile)).rejects.toThrow('Failed to read file')

    globalThis.FileReader = originalFileReader
  })
})
