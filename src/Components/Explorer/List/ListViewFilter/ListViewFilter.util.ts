import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'
import _isNumber from 'lodash/isNumber'
import _toString from 'lodash/toString'

import type { CascaderOption, FilterSelection, FilterSelectionValue } from './ListViewFilter.types'

export const findValuePath = (
  options: CascaderOption[],
  targetValue: FilterSelectionValue,
  currentPath: FilterSelection = [],
): FilterSelection | null => {
  for (const option of options) {
    const { value, children } = option

    const optionValue = _isNumber(value) ? _toString(value) : value
    const newPath = [...currentPath, optionValue]

    if (_isEqual(value, targetValue)) {
      return newPath
    }

    if (children && !_isEmpty(children)) {
      const result = findValuePath(children, targetValue, newPath)

      if (result) {
        return result
      }
    }
  }

  return null
}
