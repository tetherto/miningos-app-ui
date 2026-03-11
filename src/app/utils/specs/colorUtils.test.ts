import { describe, expect, it } from 'vitest'

import { createCategoricalColorGen, normalizeHexColor } from '../colorUtils'

describe('colorUtils', () => {
  describe('normalizeHexColor', () => {
    it('removes leading # from hex color', () => {
      expect(normalizeHexColor('#ff0000')).toBe('ff0000')
    })

    it('returns string unchanged when no leading #', () => {
      expect(normalizeHexColor('ff0000')).toBe('ff0000')
    })

    it('handles empty string', () => {
      expect(normalizeHexColor('')).toBe('')
    })
  })

  describe('createCategoricalColorGen', () => {
    it('returns a generator that yields colors in sequence', () => {
      const gen = createCategoricalColorGen()
      const first = gen.next().value
      const second = gen.next().value
      expect(first).toBeDefined()
      expect(second).toBeDefined()
      expect(typeof first).toBe('string')
    })

    it('cycles through colors when called repeatedly', () => {
      const gen = createCategoricalColorGen()
      const colors: string[] = []
      for (let i = 0; i < 10; i++) {
        colors.push(gen.next().value as string)
      }
      expect(colors.length).toBe(10)
      expect(colors.every((c) => typeof c === 'string' && c.startsWith('#'))).toBe(true)
    })
  })
})
