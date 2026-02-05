import Empty from 'antd/es/empty'
import type { ColumnsType } from 'antd/es/table'
import _find from 'lodash/find'
import _isEmpty from 'lodash/isEmpty'
import { FC, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useSearchParams } from 'react-router'

import { DeviceTable } from './components/DeviceTable'
import { ListViewHeader } from './components/ListViewHeader'
import { MinerTable } from './components/MinerTable'
import { useListViewData } from './hooks/useListViewData'
import { useListViewSelection } from './hooks/useListViewSelection'
import ListSkeleton from './ListSkeleton/ListSkeleton'
import {
  CONTAINER_DEFAULT_PAGINATION_SIZE,
  DEFAULT_PAGINATION_SIZE,
  LOADING_DELAY_MS,
  TAB,
} from './ListView.const'
import { ListViewOuterContainer, PaginatedListContainer } from './ListView.styles'
import type { ContainerRecord, ListViewProps } from './ListView.types'

import { useGetFeatureConfigQuery } from '@/app/services/api'
import {
  devicesSlice,
  selectFilterTags,
  selectSelectedContainers,
  selectSelectedDeviceTags,
  selectSelectedLVCabinets,
} from '@/app/slices/devicesSlice'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { useListViewFilters } from '@/hooks/useListViewFilters'
import { useMinerpoolWorkers } from '@/hooks/useMinerpoolWorkers'
import usePagination from '@/hooks/usePagination'
import useTimezone from '@/hooks/useTimezone'
import { getExplorerFilterTabs } from '@/Views/Explorer/Explorer.constants'

const { setFilterTags, setResetSelections } = devicesSlice.actions

const ListView: FC<ListViewProps> = ({ site, compactForMobile = false }) => {
  const dispatch = useDispatch()
  const { getFormattedDate } = useTimezone()
  const { search, pathname } = useLocation()
  const [params, setParams] = useSearchParams()
  const { data: featureConfig } = useGetFeatureConfigQuery(undefined)

  const isPoolStatsEnabled = (featureConfig as UnknownRecord)?.poolStats as boolean | undefined
  const selectedDevicesTags = useSelector(selectSelectedDeviceTags)
  const selectedContainers = useSelector(selectSelectedContainers)
  const selectedLVCabinets = useSelector(selectSelectedLVCabinets)

  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const filterTags = useSelector(selectFilterTags)
  const [previousTags, setPreviousTags] = useState(filterTags)
  const [isInternalLoading, setIsInternalLoading] = useState(false)

  const filterKey = params.get(TAB)
  const [selectedType, setSetSelectedTypeFilters] = useState<string>(
    filterKey || getExplorerFilterTabs(getFormattedDate)[0].key,
  )

  const {
    listViewFilterOptions,
    onFiltersChange,
    previousFilters,
    setPreviousFilters,
    filters,
    setFilters,
  } = useListViewFilters({
    selectedType,
    site,
  })

  const withoutFilters = _isEmpty(filters) && _isEmpty(filterTags)
  const mixMinerAndContainer =
    selectedType === CROSS_THING_TYPES.MINER || selectedType === CROSS_THING_TYPES.CONTAINER
  const containerWithoutFilters = withoutFilters && mixMinerAndContainer

  const pageSizeDefault =
    selectedType === CROSS_THING_TYPES.CONTAINER
      ? CONTAINER_DEFAULT_PAGINATION_SIZE
      : DEFAULT_PAGINATION_SIZE

  const selectedTypeInfo =
    _find(getExplorerFilterTabs(getFormattedDate), ({ key }) => key === selectedType) ||
    getExplorerFilterTabs(getFormattedDate)[0]

  const [containerMinersFilter, setContainerMinersFilter] = useState<string | undefined>(undefined)

  const { pagination, setPagination, hideNextPage } = usePagination({
    pageSize: pageSizeDefault,
  })
  const { pageSize, current } = pagination

  const handleClick = (type: string) => {
    setPreviousTags(filterTags)
    setSetSelectedTypeFilters(type)
    setIsInternalLoading(true)
    setParams({
      tab: type,
    })
    setPagination((pagination) => ({
      ...pagination,
      current: 1,
    }))

    dispatch(setFilterTags([]))
    setFilters({})
    setPreviousFilters({})
    setContainerMinersFilter(undefined)

    loadingTimerRef.current = setTimeout(() => {
      setIsInternalLoading(false)
    }, LOADING_DELAY_MS)
  }

  const { workersObj } = useMinerpoolWorkers()

  useEffect(
    () => () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (filterKey && filterKey !== selectedType) {
      handleClick(filterKey)
    } else if (!filterKey) {
      handleClick(getExplorerFilterTabs(getFormattedDate)[0].key)
    }
  }, [filterKey, handleClick, selectedType, getFormattedDate])

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((pagination) => ({
      ...pagination,
      current: page,
      pageSize: pageSize,
      total: size ? pageSize * page + 1 : pageSize * page - pageSize,
    }))
  }

  useEffect(() => {
    dispatch(setResetSelections())
  }, [dispatch, filterKey])

  const handleSearch = (value: string[]) => {
    if (containerMinersFilter) {
      const query = new URLSearchParams(search)
      query.delete('containerMiners')
      const newSearch = query.toString()
      const newUrl = `${pathname}${newSearch ? '?' + newSearch : ''}`
      window.history.replaceState({}, '', newUrl)
      setContainerMinersFilter(undefined)
      dispatch(setFilterTags(value.slice(1) as string[]))
    } else {
      dispatch(setFilterTags(value))
    }
  }

  useEffect(() => {
    const query = new URLSearchParams(search)
    const containerMiners = query.get('containerMiners')
    setContainerMinersFilter(containerMiners || undefined)
    if (containerMiners) {
      dispatch(setFilterTags([containerMiners]))
    }
  }, [search, dispatch])

  // Detect if this is a new search
  const isNewSearch =
    (filterTags !== previousTags && (!_isEmpty(filterTags) || !_isEmpty(previousTags))) ||
    filters !== previousFilters

  // Reset pagination when search changes
  useEffect(() => {
    if (isNewSearch) {
      setPreviousFilters(filters)
      setPagination((pagination) => ({
        ...pagination,
        current: 1,
      }))
    }
  }, [isNewSearch, filters, setPagination, setPreviousFilters])

  // Use custom hooks for data and selection
  const { devices, groupedDevices, minerTabDevices, size, isLoading, isFetching } = useListViewData(
    {
      selectedType,
      filterTags,
      filters,
      selectedTypeInfo,
      containerMinersFilter,
      containerWithoutFilters,
      workersObj,
      isPoolStatsEnabled,
      pageSize,
      current,
      isNewSearch,
    },
  )

  const { onSelectAllToggle, onMinerSelectionToggle, onDeviceSelectionToggle } =
    useListViewSelection({
      selectedType,
      groupedDevices,
    })

  useEffect(() => {
    hideNextPage(size)
  }, [hideNextPage, size])

  const emptyMessage = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={withoutFilters ? 'No data selected, please select filter' : 'No data'}
    />
  )

  return (
    <ListViewOuterContainer>
      <ListViewHeader
        selectedType={selectedType}
        mixMinerAndContainer={mixMinerAndContainer}
        listViewFilterOptions={listViewFilterOptions}
        onFiltersChange={onFiltersChange}
        localFilters={filters}
        handleSearch={handleSearch}
        containerMinersFilter={containerMinersFilter}
        filterTags={filterTags}
        selectedTypeInfo={selectedTypeInfo}
        isLoading={isLoading}
        compactForMobile={compactForMobile}
        filterKey={filterKey}
        handleClick={handleClick}
        explorerFilterTabs={getExplorerFilterTabs(getFormattedDate)}
      />

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <PaginatedListContainer>
          {selectedType === CROSS_THING_TYPES.MINER ? (
            <MinerTable
              minerTabDevices={minerTabDevices}
              selectedDevicesTags={selectedDevicesTags}
              selectedContainers={selectedContainers}
              onMinerSelectionToggle={onMinerSelectionToggle}
              onSelectAllToggle={onSelectAllToggle}
              withoutFilters={withoutFilters}
              isLoading={isFetching && _isEmpty(minerTabDevices) && !withoutFilters}
              isInternalLoading={isInternalLoading}
              columns={selectedTypeInfo.columns as unknown as ColumnsType<ContainerRecord>}
              current={current}
              size={size}
              pageSize={pageSize}
              handlePaginationChange={handlePaginationChange}
              emptyMessage={emptyMessage}
            />
          ) : (
            <DeviceTable
              selectedType={selectedType}
              devices={devices}
              selectedDevicesTags={selectedDevicesTags}
              selectedContainers={selectedContainers}
              selectedLVCabinets={selectedLVCabinets}
              onDeviceSelectionToggle={onDeviceSelectionToggle}
              onSelectAllToggle={onSelectAllToggle}
              isLoading={isLoading}
              isInternalLoading={isInternalLoading}
              containerWithoutFilters={containerWithoutFilters}
              columns={selectedTypeInfo.columns as unknown as ColumnsType<ContainerRecord>}
              pageSizeDefault={pageSizeDefault}
              emptyMessage={emptyMessage}
            />
          )}
        </PaginatedListContainer>
      )}
    </ListViewOuterContainer>
  )
}

export default ListView
