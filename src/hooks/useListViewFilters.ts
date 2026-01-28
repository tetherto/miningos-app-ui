import _find from 'lodash/find'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _reduce from 'lodash/reduce'
import _reject from 'lodash/reject'
import _setWith from 'lodash/setWith'
import _sortBy from 'lodash/sortBy'
import _toLower from 'lodash/toLower'
import _unset from 'lodash/unset'
import { useEffect, useState } from 'react'

import { useGetAvailableDevices } from './useGetAvailableDevices'

import { getTypeFiltersForSite } from '@/app/utils/actionUtils'
import { getFilterOptionsByTab } from '@/Components/Explorer/List/ListView.util'
import {
  CascaderOption,
  FilterSelectionTuple,
} from '@/Components/Explorer/List/ListViewFilter/ListViewFilter.types'

interface UseListViewFiltersParams {
  site?: string
  selectedType?: string
}

interface FilterGroup {
  [key: string]: string[]
}

export const useListViewFilters = ({ site, selectedType }: UseListViewFiltersParams) => {
  const [filters, setFilters] = useState<FilterGroup | undefined>()
  const availableDevices = useGetAvailableDevices()
  const [previousFilters, setPreviousFilters] = useState(filters)

  let listViewFilterOptions: CascaderOption[] = []
  if (site) {
    const siteSpecificTypeFilters = getTypeFiltersForSite(site, availableDevices)

    const filtersByTab = getFilterOptionsByTab(selectedType || '')
    const typeFilter = _find(filtersByTab, { value: 'type' })
    const siteTypeFilter = _find(siteSpecificTypeFilters, {
      value: _toLower(selectedType),
    })

    listViewFilterOptions = _sortBy(
      [
        ..._reject(filtersByTab, { value: 'type' }),
        ...(typeFilter
          ? [
              {
                ...typeFilter,
                children: siteTypeFilter?.children,
              },
            ]
          : []),
      ],
      'order',
    ) as CascaderOption[]
  }

  useEffect(() => {
    setFilters(undefined)
    setPreviousFilters(undefined)
  }, [selectedType])

  const onFiltersChange = (e: FilterSelectionTuple[]) => {
    // Use functional update to access previous filters without adding to dependencies
    setFilters((currentFilters) => {
      setPreviousFilters(currentFilters)

      const groupedSelections = _reduce(
        e,
        (result: FilterGroup, current: FilterSelectionTuple) => {
          const [key, value, childValue] = current
          const existing = _get(result, [key], []) as string[]
          _setWith(result, [key], existing.concat(childValue || value), Object)
          return result
        },
        {} as FilterGroup,
      )
      const lastAlerts = groupedSelections['last.alerts']

      if (!_isEmpty(lastAlerts) && lastAlerts?.length !== 1) {
        _unset(groupedSelections, ['last.alerts'])
      }

      return groupedSelections
    })
  }

  return {
    onFiltersChange,
    listViewFilterOptions,
    setPreviousFilters,
    previousFilters,
    filters,
    setFilters,
  }
}
