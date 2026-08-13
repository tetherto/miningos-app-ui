import { renderHook } from '@testing-library/react'

import usePreviousValue from '../usePreviousValue'

describe('usePreviousValue', () => {
  it('returns undefined on the first render', () => {
    const { result } = renderHook(({ value }) => usePreviousValue(value), {
      initialProps: { value: 'hello' },
    })
    expect(result.current).toBeUndefined()
  })

  it('returns the previous value after a string update', () => {
    const { result, rerender } = renderHook(({ value }) => usePreviousValue(value), {
      initialProps: { value: 'first' },
    })
    rerender({ value: 'second' })
    expect(result.current).toBe('first')
  })

  it('returns the second value after a third update', () => {
    const { result, rerender } = renderHook(({ value }) => usePreviousValue(value), {
      initialProps: { value: 1 },
    })
    rerender({ value: 2 })
    rerender({ value: 3 })
    expect(result.current).toBe(2)
  })

  it('works with number values', () => {
    const { result, rerender } = renderHook(({ value }) => usePreviousValue(value), {
      initialProps: { value: 10 },
    })
    rerender({ value: 20 })
    expect(result.current).toBe(10)
  })

  it('works with object references', () => {
    const obj1 = { a: 1 }
    const obj2 = { a: 2 }
    const { result, rerender } = renderHook(({ value }) => usePreviousValue(value), {
      initialProps: { value: obj1 },
    })
    rerender({ value: obj2 })
    expect(result.current).toBe(obj1)
  })

  it('does not update previous when value is the same reference', () => {
    const obj = { x: 1 }
    const { result, rerender } = renderHook(({ value }) => usePreviousValue(value), {
      initialProps: { value: obj },
    })
    rerender({ value: obj }) // same reference
    expect(result.current).toBeUndefined() // previous never changed
  })
})
