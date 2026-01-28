export type PeriodType = 'day' | 'week' | 'month'

export interface DateRange {
  start: number
  end: number
  period?: string
}
