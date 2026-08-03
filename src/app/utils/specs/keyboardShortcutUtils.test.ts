import { describe, expect, it } from 'vitest'

import { getControlSectionsTooltips } from '../keyboardShortcutUtils'

import { OsTypes } from '@/constants/platforms'

describe('keyboardShortcutUtils', () => {
  describe('getControlSectionsTooltips', () => {
    it('returns tooltips with Cmd for Mac platform', () => {
      const result = getControlSectionsTooltips(OsTypes.MAC)
      expect(result).toHaveLength(5)
      expect(result[1].desc).toContain('Cmd')
      expect(result[3].label).toContain('Cmd')
    })

    it('returns tooltips with Ctrl for non-Mac platform', () => {
      const result = getControlSectionsTooltips(OsTypes.Windows)
      expect(result).toHaveLength(5)
      expect(result[1].desc).toContain('Ctrl')
      expect(result[3].label).toContain('Ctrl')
    })

    it('returns tooltips with Ctrl for Linux', () => {
      const result = getControlSectionsTooltips(OsTypes.Linux)
      expect(result[1].desc).toContain('Ctrl')
    })
  })
})
