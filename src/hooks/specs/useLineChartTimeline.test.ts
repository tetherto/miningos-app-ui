import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import useLineChartTimeline from '../useLineChartTimeline'

describe('useLineChartTimeline', () => {
  it('returns end, setEnd, timeline, setTimeline', () => {
    const { result } = renderHook(() => useLineChartTimeline('1h'))
    expect(result.current).toHaveProperty('end')
    expect(result.current).toHaveProperty('setEnd')
    expect(result.current).toHaveProperty('timeline')
    expect(result.current).toHaveProperty('setTimeline')
  })

  it('initializes timeline from statKey', () => {
    const { result } = renderHook(() => useLineChartTimeline('5m'))
    expect(result.current.timeline).toBe('5m')
  })

  it('setEnd updates end', () => {
    const { result } = renderHook(() => useLineChartTimeline('1h'))
    act(() => {
      result.current.setEnd(123)
    })
    expect(result.current.end).toBe(123)
  })
})
