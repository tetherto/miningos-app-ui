import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _reject from 'lodash/reject'
import _some from 'lodash/some'
import { type FC, useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { TimeFrameControlRow, TimeframeControlsRoot } from '../../Common.style'

import { MONTHS, monthsForYear, rangeOfMonth, rangeOfYear, weeksOfMonth, YEARS } from './helper'

import { getTimeframeType, setTimeframeType } from '@/app/slices/multiSiteSlice'
import MosSelect from '@/Components/MosSelect/MosSelect'
import { DropdownContainer } from '@/Components/MosSelect/MosSelect.styles'
import { PERIOD, TIMEFRAME_TYPE } from '@/constants/ranges'
import useTimezone from '@/hooks/useTimezone'
import { TimeframeType } from '@/types/redux'

export interface DateRange {
  start: number
  end: number
  period?: string
}
interface TimeframeControlsProps {
  onRangeChange?: (
    range: [Date, Date],
    options?: { year?: number; month?: number; period?: string },
  ) => void
  dateRange?: DateRange
  isMonthSelectVisible?: boolean
  isWeekSelectVisible?: boolean
}

interface TimeSelection {
  year: number
  start: Date
  end: Date
  month?: number
  label?: string
}

const PERIOD_BY_TYPE = {
  [TIMEFRAME_TYPE.YEAR]: PERIOD.MONTHLY,
  [TIMEFRAME_TYPE.MONTH]: PERIOD.DAILY,
  [TIMEFRAME_TYPE.WEEK]: PERIOD.DAILY,
}

export const TimeframeControls: FC<TimeframeControlsProps> = ({
  onRangeChange,
  dateRange,
  isMonthSelectVisible = true,
  isWeekSelectVisible = true,
}) => {
  const CURRENT_YEAR = new Date().getFullYear()
  const dispatch = useDispatch()
  const selectorType = useSelector(getTimeframeType)
  const { timezone } = useTimezone()

  const currentMonth = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    label: new Date().toLocaleString('en', { month: 'long' }),
  }

  const [selectedYear, setSelectedYear] = useState<TimeSelection | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<TimeSelection | null>({
    year: currentMonth.year,
    month: currentMonth.month,
    label: currentMonth.label,
    start: rangeOfMonth(currentMonth.year, currentMonth.month)[0],
    end: rangeOfMonth(currentMonth.year, currentMonth.month)[1],
  })
  const [selectedWeek, setSelectedWeek] = useState<TimeSelection | null>(null)

  const [expandedYearsMonth, setExpandedYearsMonth] = useState<Record<number, boolean>>({
    [CURRENT_YEAR]: true,
  })
  const [expandedYearsWeek, setExpandedYearsWeek] = useState<Record<number, boolean>>({
    [CURRENT_YEAR]: true,
  })
  const [expandedMonthsWeek, setExpandedMonthsWeek] = useState<Record<string, boolean>>({}) // key: `${y}-${month}`

  interface WeekData {
    start: Date
    end: Date
    label?: string
    disabled?: boolean
  }

  const weeksCache = (() => {
    const map: Record<string, WeekData[]> = {}
    _forEach(YEARS, (y: number) => {
      _forEach(MONTHS, ({ month }) => {
        map[`${y}-${month}`] = weeksOfMonth(y, month, timezone)
      })
    })
    return map
  })()

  const visibleYears = _filter(YEARS, (y: number) =>
    _some(MONTHS, ({ month }) => {
      const weeks = weeksCache[`${y}-${month}`]
      return _some(weeks, (w: WeekData) => !w.disabled)
    }),
  )

  const visibleMonthsByYear = _reduce(
    visibleYears,
    (acc: Record<number, typeof MONTHS>, y: number) => {
      acc[y] = _filter(MONTHS, ({ month }) => {
        const weeks = weeksCache[`${y}-${month}`]
        return _some(weeks, (w: WeekData) => !w.disabled)
      })
      return acc
    },
    {},
  )

  const setExclusive = (type: string, value: TimeSelection) => {
    setSelectedYear(type === TIMEFRAME_TYPE.YEAR ? value : null)
    setSelectedMonth(type === TIMEFRAME_TYPE.MONTH ? value : null)
    setSelectedWeek(type === TIMEFRAME_TYPE.WEEK ? value : null)
  }

  const applySelection = (
    type: string,
    payload: { start: Date; end: Date; year: number; month?: number; label?: string } | null,
    close?: VoidFunction,
  ) => {
    if (!payload) return
    const { start, end, year, month, label } = payload
    if (!start || !end) return

    if (type === TIMEFRAME_TYPE.YEAR) setExclusive(type, { year, start, end })
    if (type === TIMEFRAME_TYPE.MONTH) setExclusive(type, { year, month, label, start, end })
    if (type === TIMEFRAME_TYPE.WEEK) setExclusive(type, { year, month, label, start, end })

    onRangeChange?.([start, end], {
      year,
      month,
      period: (PERIOD_BY_TYPE as Record<string, string>)[type],
    })
    dispatch(setTimeframeType(type as TimeframeType))
    close?.()
  }

  const resetPeriods = () => {
    setSelectedYear(null)
    setSelectedMonth(null)
    setSelectedWeek(null)
  }

  useEffect(() => {
    if (!selectorType || !dateRange?.start || !dateRange?.end) return

    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    const y = startDate.getFullYear()
    const m = startDate.getMonth()

    if (selectorType === TIMEFRAME_TYPE.YEAR) {
      const [ys, ye] = rangeOfYear(y)
      resetPeriods()
      setSelectedYear({ year: y, start: ys, end: ye })
    } else if (selectorType === TIMEFRAME_TYPE.MONTH) {
      const label = startDate.toLocaleString('en', { month: 'long' })
      const [ms, me] = rangeOfMonth(y, m)
      resetPeriods()
      setSelectedMonth({ year: y, month: m, label, start: ms, end: me })
    } else if (selectorType === TIMEFRAME_TYPE.WEEK) {
      const key = `${y}-${m}`
      const weeks = _reject(weeksCache[key] || [], 'disabled')
      const match = _find(
        weeks,
        (w: WeekData) =>
          w.start.getTime() === startDate.getTime() && w.end.getTime() === endDate.getTime(),
      )
      if (match) {
        resetPeriods()
        setSelectedWeek({
          year: y,
          month: m,
          label: match.label,
          start: match.start,
          end: match.end,
        })
      }
    }
  }, [selectorType, dateRange?.start, dateRange?.end, weeksCache])

  // Handlers for clicks
  const onYearClick = ({ year, close }: { year: number; close: VoidFunction }) => {
    const [start, end] = rangeOfYear(year)
    applySelection(TIMEFRAME_TYPE.YEAR, { year, start, end }, close)
  }

  const onMonthClick = ({
    year,
    month,
    label,
    close,
  }: {
    year: number
    month: number
    label: string
    close: VoidFunction
  }) => {
    const [start, end] = rangeOfMonth(year, month)
    applySelection(TIMEFRAME_TYPE.MONTH, { year, month, label, start, end }, close)
  }

  const onWeekClick = ({
    year,
    month,
    label,
    start,
    end,
    close,
  }: {
    year: number
    month: number
    label: string
    start: Date
    end: Date
    close: VoidFunction
  }) => {
    applySelection(TIMEFRAME_TYPE.WEEK, { year, month, label, start, end }, close)
  }

  return (
    <TimeframeControlsRoot>
      <TimeFrameControlRow>
        {/* YEAR SELECT */}
        <MosSelect
          placeholder="Year"
          isActive={!!selectedYear}
          renderValue={() => (selectedYear ? String(selectedYear.year) : 'Year')}
          renderContent={({ close }) => (
            <DropdownContainer>
              {_map(YEARS, (y: number) => (
                <div
                  key={y}
                  className={`menu-item ${selectedYear?.year === y ? 'active' : ''}`}
                  onClick={() =>
                    onYearClick({
                      year: y,
                      close,
                    })
                  }
                >
                  {y}
                </div>
              ))}
            </DropdownContainer>
          )}
        />

        {/* MONTH SELECT */}
        {isMonthSelectVisible && (
          <MosSelect
            placeholder="Month"
            isActive={!!selectedMonth}
            renderValue={() =>
              selectedMonth ? `${selectedMonth.label} ${selectedMonth.year}` : 'Month'
            }
            renderContent={({ close }) => (
              <DropdownContainer $limitedHeight>
                {_map(YEARS, (y: number) => {
                  const opened = !!expandedYearsMonth[y]
                  return (
                    <div key={y}>
                      <div className="group-header">
                        <span>{y}</span>
                        <button
                          className="tiny-btn"
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation()
                            setExpandedYearsMonth((s: Record<number, boolean>) => ({
                              ...s,
                              [y]: !opened,
                            }))
                          }}
                        >
                          {opened ? '−' : '+'}
                        </button>
                      </div>
                      {opened &&
                        _map(monthsForYear(y).slice().reverse(), ({ month, label }) => (
                          <div
                            key={`${y}-${month}`}
                            className={`menu-item ${
                              selectedMonth &&
                              selectedMonth.year === y &&
                              selectedMonth.month === month
                                ? 'active'
                                : ''
                            }`}
                            onClick={() => onMonthClick({ year: y, month, label, close })}
                          >
                            {label}
                          </div>
                        ))}
                    </div>
                  )
                })}
              </DropdownContainer>
            )}
          />
        )}
      </TimeFrameControlRow>

      {/* WEEK SELECT */}
      {isWeekSelectVisible && (
        <MosSelect
          placeholder="Week"
          isActive={!!selectedWeek}
          renderValue={() => (selectedWeek ? selectedWeek.label : 'Week')}
          renderContent={({ close }) => (
            <DropdownContainer $limitedHeight>
              {_map(visibleYears, (y: number) => {
                const isYearOpen = !!expandedYearsWeek[y]
                const visibleMonths = visibleMonthsByYear[y] || []

                return (
                  <div key={`y-${y}`}>
                    <div className="group-header">
                      <span>{y}</span>
                      <button
                        className="tiny-btn"
                        onClick={(e: MouseEvent) => {
                          e.stopPropagation()
                          setExpandedYearsWeek((s: Record<number, boolean>) => ({
                            ...s,
                            [y]: !isYearOpen,
                          }))
                        }}
                      >
                        {isYearOpen ? '−' : '+'}
                      </button>
                    </div>

                    {isYearOpen &&
                      _map(visibleMonths.slice().reverse(), ({ month, label }) => {
                        const key = `${y}-${month}`
                        const isMonthOpen = !!expandedMonthsWeek[key]
                        const weeks = _reject(weeksCache[key] || [], 'disabled')

                        return (
                          <div key={key}>
                            <div className="group-subheader">
                              <span>{label}</span>
                              <button
                                className="tiny-btn"
                                onClick={(e: MouseEvent) => {
                                  e.stopPropagation()
                                  setExpandedMonthsWeek((s: Record<string, boolean>) => ({
                                    ...s,
                                    [key]: !isMonthOpen,
                                  }))
                                }}
                              >
                                {isMonthOpen ? '−' : '+'}
                              </button>
                            </div>
                            {isMonthOpen &&
                              _map(weeks.slice().reverse(), (w: WeekData, i: number) => (
                                <div
                                  key={`${key}-w-${i}`}
                                  className={`menu-item week ${
                                    selectedWeek?.start?.getTime() === w.start.getTime()
                                      ? 'active'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    onWeekClick({
                                      year: y,
                                      month,
                                      label: w.label ?? '',
                                      start: w.start,
                                      end: w.end,
                                      close,
                                    })
                                  }
                                >
                                  {w.label}
                                </div>
                              ))}
                          </div>
                        )
                      })}
                  </div>
                )
              })}
            </DropdownContainer>
          )}
        />
      )}
    </TimeframeControlsRoot>
  )
}
