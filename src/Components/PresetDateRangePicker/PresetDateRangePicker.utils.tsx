import { addDays } from 'date-fns/addDays'
import _every from 'lodash/every'
import _isDate from 'lodash/isDate'
import _isNaN from 'lodash/isNaN'
import _map from 'lodash/map'

import { PRESET_ACTIVITY_DATE_DIFF_THRESHOLD_MS } from './PresetDateRangePicker.const'

import { RANGES } from '@/constants/ranges'

export const toggleRootInteractivityMode = (forceRemove = false) => {
  const action = forceRemove ? 'remove' : 'toggle'

  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.classList[action]('non-interactive')
  }
}

export const getRangePresets = (): PresetItem[] => {
  const end = new Date()

  return [
    {
      label: RANGES.LAST7,
      value: [addDays(end, -7), end],
    },
    {
      label: RANGES.LAST14,
      value: [addDays(end, -14), end],
    },
    {
      label: RANGES.LAST30,
      value: [addDays(end, -30), end],
    },
    {
      label: RANGES.LAST90,
      value: [addDays(end, -90), end],
    },
  ]
}

type DateRangeValue = Date[] | null
export type PresetItem = {
  label: string
  value: [Date, Date]
}

export const valueToDatesPair = (value: DateRangeValue): [Date, Date] | null => {
  if (!value || value.length !== 2) return null

  return _map(value, (item: unknown) => {
    if (_isDate(item)) {
      return item
    }

    return new Date(item as number)
  }) as unknown as [Date, Date]
}

export const isPresetActive = (item: PresetItem, pickedValue: DateRangeValue): boolean => {
  const pickedDates = valueToDatesPair(pickedValue)

  if (!pickedDates) return false

  return _every(item.value, (itemDate, index) => {
    let pickedDate = pickedDates[index]

    if (!pickedDate) {
      return false
    }

    if (!_isDate(pickedDate)) {
      pickedDate = new Date(pickedDate)
    }

    const pickedTime = pickedDate.getTime()

    if (_isNaN(pickedTime)) {
      return false
    }

    const diff = Math.abs(pickedTime - itemDate.getTime())

    return diff < PRESET_ACTIVITY_DATE_DIFF_THRESHOLD_MS
  })
}
