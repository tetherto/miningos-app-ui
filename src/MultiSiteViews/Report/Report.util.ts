import { format as fmt } from 'date-fns/format'
import { parse } from 'date-fns/parse'
import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _map from 'lodash/map'
import _replace from 'lodash/replace'
import _split from 'lodash/split'
import _toLower from 'lodash/toLower'
import _trim from 'lodash/trim'

import { ReportApiResponse, LogEntry } from './Report.types'

import { PERIOD } from '@/constants/ranges'

export const PERIOD_MAP: Record<string, string> = {
  weekly: 'daily',
  monthly: 'daily',
  yearly: 'monthly',
}

export const DATE_FORMAT = 'MMM dd, yyyy'
export const API_DATE_FORMAT = 'yyyy-MM-dd'

export const sanitizeFileName = (location: string): string =>
  _toLower(_replace(location, /\s+/g, '-'))

export const parseDateRange = (dateRange: string) => {
  const [fromRaw, toRaw] = _map(_split(dateRange, '-'), (s) => _trim(s))

  const toParts = _split(toRaw, ',') || []
  const year = _trim(toParts[1])

  const startDateStr = year ? `${fromRaw}, ${year}` : fromRaw
  const endDateStr = toRaw

  try {
    const startDate = fmt(parse(startDateStr, DATE_FORMAT, new Date()), API_DATE_FORMAT)
    const endDate = fmt(parse(endDateStr, DATE_FORMAT, new Date()), API_DATE_FORMAT)
    return { startDate, endDate, startDateStr, endDateStr }
  } catch {
    return {
      startDate: fmt(new Date(), API_DATE_FORMAT),
      endDate: fmt(new Date(), API_DATE_FORMAT),
      startDateStr,
      endDateStr,
    }
  }
}

export const getMonthYear = (dateRange: string) => {
  const [firstPart] = _split(dateRange, '-')
  const [, yearPart] = _split(dateRange, ',')

  if (!yearPart) return { monthName: '', year: '' }

  try {
    const dateStr = `${_trim(firstPart)},${yearPart}`
    const date = new Date(dateStr)
    return {
      monthName: date.toLocaleString('en-US', { month: 'long' }),
      year: date.getFullYear(),
    }
  } catch {
    return { monthName: '', year: '' }
  }
}

export const formatDateForFilename = (dateRange: string): string => {
  try {
    const { startDate, endDate } = parseDateRange(dateRange)
    // Convert YYYY-MM-DD to YYYYMMDD format for cleaner filenames
    const startFormatted = _replace(startDate, /-/g, '')
    const endFormatted = _replace(endDate, /-/g, '')
    return `${startFormatted}-${endFormatted}`
  } catch {
    return 'date-unknown'
  }
}

export const getPeriod = (api: ReportApiResponse | undefined): string =>
  api?.period || api?.regions?.[0]?.log?.[0]?.period || api?.data?.log?.[0]?.period || 'daily'

export const makeLabelFormatter = (period: string): ((ts: number) => string) => {
  if (period === PERIOD.MONTHLY) return (ts: number) => fmt(new Date(Number(ts)), 'MM-yy')
  return (ts: number) => fmt(new Date(Number(ts)), 'dd-MM')
}

export const pickLogs = (
  api: ReportApiResponse | undefined,
  regionFilter?: string[],
): { logsPerSource: LogEntry[][]; period: string } => {
  const regions = _isArray(api?.regions) ? api.regions : []
  const period = getPeriod(api)

  if (regionFilter?.length) {
    const selected = _filter(regions, (r) => _includes(regionFilter, r.region))
    return { logsPerSource: _map(selected, (r) => r.log || []), period }
  }

  if (_isArray(api?.data?.log)) {
    return { logsPerSource: [api.data.log], period }
  }

  return { logsPerSource: _map(regions, (r) => r.log || []), period }
}
