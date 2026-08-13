/**
 * Container helper and utility functions
 */
import _isFinite from 'lodash/isFinite'
import _reduce from 'lodash/reduce'
import _toPairs from 'lodash/toPairs'

import { parseMonthLabelToDate } from '../dateUtils'

import type { ContainerParamsOptions, ContainerParamsSetting } from './types'

export const sortAlphanumeric = (array: string[]): string[] => array?.sort(naturalSorting)

export const naturalSorting = (a: string, b: string): number => {
  const dateA = parseMonthLabelToDate(a)
  const dateB = parseMonthLabelToDate(b)

  if (dateA && dateB) {
    return dateA.getTime() - dateB.getTime()
  }

  // fallback: default natural string compare
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

const SETTINGS_DEMO_TINY_DIFF = 0.0001

export const getContainerParamsSettingList = (
  minByCharMap: Record<string, number>,
  options?: ContainerParamsOptions,
): ContainerParamsSetting[] => {
  const pairs = _toPairs(minByCharMap)

  return _reduce(
    pairs,
    (acc, [label, min], index, { length: count }) => {
      const max = index < count - 1 ? pairs[index + 1][1] : Infinity
      const hasMin = _isFinite(min)
      const hasMax = _isFinite(max)
      const unitAppendix = options?.unit ? ` ${options.unit}` : ''
      const pre = hasMin ? `>= ${min}${unitAppendix}` : ''
      const post = hasMax ? `< ${max}${unitAppendix}` : ''
      const mid = hasMin && hasMax ? ' & ' : ''

      let value = hasMin && hasMax ? min + (max - min) / 2 : undefined

      if (!_isFinite(value)) {
        value = hasMin ? min + SETTINGS_DEMO_TINY_DIFF : max - SETTINGS_DEMO_TINY_DIFF
      }

      acc.push({
        label,
        description: `${pre}${mid}${post}`,
        highlightColor: options?.getHighlightColor?.(value!) ?? '',
        isFlashing: options?.getIsFlashing?.(value!) ?? false,
        isSuperflashing: options?.getIsSuperflashing?.(value!) ?? false,
      })

      return acc
    },
    [] as ContainerParamsSetting[],
  )
}
