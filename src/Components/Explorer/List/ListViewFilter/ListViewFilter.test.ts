import { describe, it, expect } from 'vitest'

import type { CascaderOption } from './ListViewFilter.types'
import { findValuePath } from './ListViewFilter.util'

describe('findValuePath', () => {
  it('should find a value at the root level', () => {
    const options: CascaderOption[] = [
      { label: 'Option 1', value: 'value1' },
      { label: 'Option 2', value: 'value2' },
    ]

    const result = findValuePath(options, 'value1')
    expect(result).toEqual(['value1'])
  })

  it('should find a value in nested children', () => {
    const options: CascaderOption[] = [
      {
        label: 'Parent',
        value: 'parent',
        children: [
          { label: 'Child 1', value: 'child1' },
          { label: 'Child 2', value: 'child2' },
        ],
      },
    ]

    const result = findValuePath(options, 'child2')
    expect(result).toEqual(['parent', 'child2'])
  })

  it('should find a value in deeply nested structure', () => {
    const options: CascaderOption[] = [
      {
        label: 'Level 1',
        value: 'level1',
        children: [
          {
            label: 'Level 2',
            value: 'level2',
            children: [{ label: 'Level 3', value: 'level3' }],
          },
        ],
      },
    ]

    const result = findValuePath(options, 'level3')
    expect(result).toEqual(['level1', 'level2', 'level3'])
  })

  it('should convert number values to strings in the path', () => {
    const options: CascaderOption[] = [
      {
        label: 'Parent',
        value: 100,
        children: [{ label: 'Child', value: 200 }],
      },
    ]

    const result = findValuePath(options, 200)
    expect(result).toEqual(['100', '200'])
  })

  it('should handle boolean values', () => {
    const options: CascaderOption[] = [
      { label: 'True Option', value: true },
      { label: 'False Option', value: false },
    ]

    const result = findValuePath(options, true)
    expect(result).toEqual([true])
  })

  it('should return null when value is not found', () => {
    const options: CascaderOption[] = [
      { label: 'Option 1', value: 'value1' },
      { label: 'Option 2', value: 'value2' },
    ]

    const result = findValuePath(options, 'nonexistent')
    expect(result).toBeNull()
  })

  it('should return null for empty options array', () => {
    const result = findValuePath([], 'value1')
    expect(result).toBeNull()
  })

  it('should find the first matching value when duplicates exist', () => {
    const options: CascaderOption[] = [
      { label: 'First', value: 'duplicate' },
      { label: 'Second', value: 'duplicate' },
    ]

    const result = findValuePath(options, 'duplicate')
    expect(result).toEqual(['duplicate'])
  })

  it('should search multiple branches correctly', () => {
    const options: CascaderOption[] = [
      {
        label: 'Branch 1',
        value: 'branch1',
        children: [{ label: 'Child A', value: 'childA' }],
      },
      {
        label: 'Branch 2',
        value: 'branch2',
        children: [{ label: 'Child B', value: 'childB' }],
      },
    ]

    const result = findValuePath(options, 'childB')
    expect(result).toEqual(['branch2', 'childB'])
  })
})
