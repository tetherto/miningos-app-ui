import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _some from 'lodash/some'
import _toLower from 'lodash/toLower'
import _trim from 'lodash/trim'
import type React from 'react'

interface UseInventoryItemFilterParams {
  setFilteredItems?: (items: unknown[]) => void
  allItems?: unknown[]
  attributes?: string[]
}

const normalize = (value: unknown): string => _toLower(_trim(String(value ?? '')))

const useInventoryItemFilter = ({
  setFilteredItems,
  allItems = [],
  attributes = [],
}: UseInventoryItemFilterParams) => {
  const handleFilterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = normalize(e.target.value)

    if (!searchText) {
      setFilteredItems?.(allItems)
      return
    }

    const filteredItems = _filter(allItems, (item) =>
      _some(attributes, (attr) => _includes(normalize(_get(item, attr)), searchText)),
    )

    setFilteredItems?.(filteredItems)
  }

  return {
    handleFilterSelect,
  }
}

export default useInventoryItemFilter
