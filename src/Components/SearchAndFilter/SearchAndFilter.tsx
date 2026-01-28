import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _reduce from 'lodash/reduce'
import _setWith from 'lodash/setWith'
import _unset from 'lodash/unset'
import { useDispatch, useSelector } from 'react-redux'

import { devicesSlice, selectFilterTags } from '../../app/slices/devicesSlice'
import {
  ListViewSearchFilterContainer,
  SearchBarContainer,
  StyledSelect,
} from '../Explorer/List/ListView.styles'
import ListViewFilter from '../Explorer/List/ListViewFilter/ListViewFilter'
import {
  CascaderOption,
  FilterSelectionTuple,
} from '../Explorer/List/ListViewFilter/ListViewFilter.types'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

const { setFilterTags } = devicesSlice.actions

interface SearchAndFilterProps {
  setFilters: (filters: UnknownRecord) => void
  filterOptions: CascaderOption[]
  placeholder?: string
  filters?: UnknownRecord
}

export const SearchAndFilter = ({
  setFilters,
  filterOptions,
  placeholder = '',
  filters,
}: SearchAndFilterProps) => {
  const dispatch = useDispatch()
  const filterTags = useSelector(selectFilterTags)

  const onFiltersChange = (e: FilterSelectionTuple[]) => {
    const groupedSelections = _reduce<FilterSelectionTuple, UnknownRecord>(
      e,
      (result: UnknownRecord, current: FilterSelectionTuple) => {
        if (current.length < 2) return result

        const key = String(current[0])
        const value = current[current.length - 1]

        _setWith(result, [key], (_get(result, [key], []) as unknown[]).concat(value), Object)
        return result
      },
      {},
    )
    const alertsKey = 'last.alerts' as keyof UnknownRecord
    if (!_isEmpty(groupedSelections[alertsKey])) {
      const alerts = groupedSelections[alertsKey] as unknown[]
      if (alerts?.length !== 1) {
        _unset(groupedSelections, ['last.alerts'])
      }
    }
    setFilters(groupedSelections)
  }

  const handleSearch = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
      dispatch(setFilterTags(value))
    } else if (value) {
      dispatch(setFilterTags([value]))
    } else {
      dispatch(setFilterTags([]))
    }
  }

  return (
    <ListViewSearchFilterContainer>
      <ListViewFilter options={filterOptions} onChange={onFiltersChange} localFilters={filters} />
      <SearchBarContainer>
        <StyledSelect
          mode="tags"
          placeholder={placeholder || 'Search'}
          onChange={(value: unknown) => handleSearch(value as string | string[] | undefined)}
          tokenSeparators={[',']}
          value={filterTags}
        />
      </SearchBarContainer>
    </ListViewSearchFilterContainer>
  )
}
