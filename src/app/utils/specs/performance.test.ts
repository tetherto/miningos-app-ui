import { describe, expect, it, vi } from 'vitest'

const mockLodash = { default: { __test: true } }
vi.mock('lodash', () => mockLodash)

describe('performance', () => {
  describe('loadJsLibrary', () => {
    it('dynamically imports and returns the library default', async () => {
      const { loadJsLibrary } = await import('../performance')
      const result = await loadJsLibrary<{ __test: boolean }>('lodash')
      expect(result).toBeDefined()
      expect(result.__test).toBe(true)
    })
  })
})
