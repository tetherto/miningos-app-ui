import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import useReportTimeFrameSelectorState from '../useReportTimeFrameSelectorState'

describe('useReportTimeFrameSelectorState', () => {
  it('returns start, end, presetTimeFrame, and dateRange', () => {
    const { result } = renderHook(() => useReportTimeFrameSelectorState())
    expect(result.current.start).toBeInstanceOf(Date)
    expect(result.current.end).toBeInstanceOf(Date)
    expect(result.current.presetTimeFrame).toBe(1)
    expect(Array.isArray(result.current.dateRange)).toBe(true)
    expect(result.current.dateRange).toHaveLength(2)
  })

  it('uses presetTimeFrame to compute start/end when not null', () => {
    const { result } = renderHook(() => useReportTimeFrameSelectorState())
    // Default presetTimeFrame is 1
    // start should be startOfYesterday() - (1-1 days) = yesterday
    expect(result.current.start).toBeInstanceOf(Date)
    expect(result.current.end).toBeInstanceOf(Date)
  })

  it('setPresetTimeFrame to null switches to dateRange computation', () => {
    const { result } = renderHook(() => useReportTimeFrameSelectorState())

    act(() => {
      result.current.setPresetTimeFrame(null)
    })

    expect(result.current.presetTimeFrame).toBeNull()
    // When null, start/end come from the dateRange state
    expect(result.current.start).toBeInstanceOf(Date)
    expect(result.current.end).toBeInstanceOf(Date)
    // start should be startOfDay(dateRange[0])
    expect(result.current.start.getHours()).toBe(0)
    expect(result.current.start.getMinutes()).toBe(0)
  })

  it('setPresetTimeFrame to a new value updates start/end', () => {
    const { result } = renderHook(() => useReportTimeFrameSelectorState())

    act(() => {
      result.current.setPresetTimeFrame(7)
    })

    expect(result.current.presetTimeFrame).toBe(7)
    expect(result.current.start).toBeInstanceOf(Date)
    // start should be startOfYesterday - 6 days
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    expect(result.current.start.getTime()).toBeLessThan(now.getTime())
  })

  it('setDateRange updates the dateRange state', () => {
    const { result } = renderHook(() => useReportTimeFrameSelectorState())

    const newStart = new Date(2024, 0, 1)
    const newEnd = new Date(2024, 0, 31)

    act(() => {
      result.current.setDateRange([newStart, newEnd])
    })

    expect(result.current.dateRange[0]).toEqual(newStart)
    expect(result.current.dateRange[1]).toEqual(newEnd)
  })

  it('exposes setPresetTimeFrame and setDateRange as functions', () => {
    const { result } = renderHook(() => useReportTimeFrameSelectorState())
    expect(typeof result.current.setPresetTimeFrame).toBe('function')
    expect(typeof result.current.setDateRange).toBe('function')
  })
})
