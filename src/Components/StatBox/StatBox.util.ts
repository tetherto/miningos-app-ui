import { formatNumber } from '@/app/utils/format'

export const getDisplayValue = (value: number, isLoading: boolean): string | number => {
  if (isLoading) return '-'
  if (value > 0) return formatNumber(value)

  return 0
}
