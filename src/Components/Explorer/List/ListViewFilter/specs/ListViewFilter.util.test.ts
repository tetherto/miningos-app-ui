import { describe, expect, it } from 'vitest'

import type { CascaderOption } from '../ListViewFilter.types'
import { findValuePath } from '../ListViewFilter.util'

describe('ListViewFilter.util', () => {
  describe('findValuePath', () => {
    const flatOptions: CascaderOption[] = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
    ]

    it('returns path for top-level value', () => {
      expect(findValuePath(flatOptions, 'b')).toEqual(['b'])
    })

    it('returns path with single segment for first option', () => {
      expect(findValuePath(flatOptions, 'a')).toEqual(['a'])
    })

    it('returns null when value not found', () => {
      expect(findValuePath(flatOptions, 'x')).toBeNull()
    })

    it('finds value in nested children', () => {
      const nested: CascaderOption[] = [
        { label: 'Group', value: 'g', children: [{ label: 'Child', value: 'ch' }] },
      ]
      expect(findValuePath(nested, 'ch')).toEqual(['g', 'ch'])
    })

    it('handles numeric value', () => {
      const withNumber: CascaderOption[] = [{ label: 'N', value: 1 }]
      expect(findValuePath(withNumber, 1)).toEqual(['1'])
    })

    it('returns null for empty options', () => {
      expect(findValuePath([], 'x')).toBeNull()
    })
  })
})
