import _capitalize from 'lodash/capitalize'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _reduce from 'lodash/reduce'
import _reject from 'lodash/reject'
import _setWith from 'lodash/setWith'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useGetSiteQuery } from '../../../app/services/api'
import { devicesSlice, selectFilterTags } from '../../../app/slices/devicesSlice'
import { getTypeFiltersForSite } from '../../../app/utils/actionUtils'
import ListViewFilter from '../../../Components/Explorer/List/ListViewFilter/ListViewFilter'
import type { FilterSelectionTuple } from '../../../Components/Explorer/List/ListViewFilter/ListViewFilter.types'
import { useGetAvailableDevices } from '../../../hooks/useGetAvailableDevices'
import type { LocalFilters } from '../CurrentAlerts/CurrentAlerts'

import { ALERTS_FILTER_OPTIONS } from './TagFilterBar.const'
import { StyledSelect, TagFilterBarContainer } from './TagFilterBar.styles'
interface TagFilterBarProps {
  placeholder?: string
  setLocalFilters: (filters: LocalFilters) => void
  localFilters: LocalFilters
  onSearchChange: (value: string[]) => void
}

const { setFilterTags } = devicesSlice.actions

const TagFilterBar: React.FC<TagFilterBarProps> = ({
  setLocalFilters,
  placeholder,
  localFilters,
  onSearchChange,
}) => {
  const filterTags = useSelector(selectFilterTags) as string[]
  const dispatch = useDispatch()

  const handleSearch = (value: unknown) => {
    const tags = value as string[]
    onSearchChange(tags)
    dispatch(setFilterTags(tags))
  }

  const { data: siteData } = useGetSiteQuery({} as Record<string, unknown>)

  const currentSite = _capitalize(_get(siteData, ['site'], ''))

  const availableDevices = useGetAvailableDevices()
  const siteSpecificTypeFilters = getTypeFiltersForSite(currentSite, availableDevices)

  const options = [
    ..._reject(ALERTS_FILTER_OPTIONS, { value: 'type' }),
    {
      ...(_find(ALERTS_FILTER_OPTIONS, { value: 'type' }) as (typeof ALERTS_FILTER_OPTIONS)[0]),
      children: siteSpecificTypeFilters,
    },
  ]

  const onFiltersChange = (selections: FilterSelectionTuple[]) => {
    const groupedSelections = _reduce(
      selections,
      (result: LocalFilters, current) => {
        const [key, value, childValue] = current
        const existingValues = (_get(result, [key], []) as string[]) || []
        _setWith(result, [key], existingValues.concat(childValue ? childValue : value), Object)
        return result
      },
      {},
    )
    setLocalFilters(groupedSelections)
  }

  return (
    <TagFilterBarContainer>
      <ListViewFilter options={options} onChange={onFiltersChange} localFilters={localFilters} />
      <StyledSelect
        mode="tags"
        placeholder={placeholder || 'Search'}
        onChange={handleSearch}
        tokenSeparators={[',']}
        value={filterTags}
      />
    </TagFilterBarContainer>
  )
}

export default TagFilterBar
