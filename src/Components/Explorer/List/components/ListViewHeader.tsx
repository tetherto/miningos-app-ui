import type { DefaultOptionType } from 'antd/es/select'
import _map from 'lodash/map'
import { FC } from 'react'

import {
  FilterRow,
  ListViewSearchFilterContainer,
  StyledSelect,
  TabsWrapper,
} from '../ListView.styles'
import ListViewFilter from '../ListViewFilter/ListViewFilter'
import type { CascaderOption, FilterSelectionTuple } from '../ListViewFilter/ListViewFilter.types'

import { StyledButton } from '@/styles/shared-styles'

interface ListViewHeaderProps {
  selectedType: string
  mixMinerAndContainer: boolean
  listViewFilterOptions: CascaderOption[]
  onFiltersChange: (selections: FilterSelectionTuple[]) => void
  localFilters: Record<string, string[]> | undefined
  handleSearch: (value: string[]) => void
  containerMinersFilter?: string
  filterTags: string[]
  selectedTypeInfo: {
    searchOptions?: DefaultOptionType[]
    [key: string]: unknown
  }
  isLoading: boolean
  compactForMobile: boolean
  filterKey: string | null
  handleClick: (key: string) => void
  explorerFilterTabs: Array<{ key: string; label: string }>
}

export const ListViewHeader: FC<ListViewHeaderProps> = ({
  selectedType,
  mixMinerAndContainer,
  listViewFilterOptions,
  onFiltersChange,
  localFilters,
  handleSearch,
  containerMinersFilter,
  filterTags,
  selectedTypeInfo,
  isLoading,
  compactForMobile,
  filterKey,
  handleClick,
  explorerFilterTabs,
}) => {
  const renderTabs = _map(explorerFilterTabs, ({ key, label }) => (
    <StyledButton
      key={key}
      disabled={isLoading}
      $isActive={filterKey === key}
      onClick={() => handleClick(key)}
    >
      {label}
    </StyledButton>
  ))

  return (
    <ListViewSearchFilterContainer key={selectedType}>
      <FilterRow>
        {mixMinerAndContainer && (
          <ListViewFilter
            options={listViewFilterOptions}
            onChange={onFiltersChange}
            localFilters={localFilters}
          />
        )}
        <StyledSelect
          mode="tags"
          placeholder="Search"
          onChange={(value: unknown) => handleSearch(value as string[])}
          tokenSeparators={[',']}
          value={containerMinersFilter ? [`container-${containerMinersFilter}`] : filterTags}
          options={selectedTypeInfo?.searchOptions || []}
        />
      </FilterRow>

      <TabsWrapper $compactForMobile={compactForMobile} $isLoading={isLoading}>
        {renderTabs}
      </TabsWrapper>
    </ListViewSearchFilterContainer>
  )
}
