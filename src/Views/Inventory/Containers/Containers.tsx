import _capitalize from 'lodash/capitalize'
import _difference from 'lodash/difference'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _map from 'lodash/map'
import _replace from 'lodash/replace'
import _slice from 'lodash/slice'
import _split from 'lodash/split'
import _startCase from 'lodash/startCase'
import _toLower from 'lodash/toLower'
import _toUpperCase from 'lodash/toUpper'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

import { useGetListThingsQuery, useGetSiteQuery } from '../../../app/services/api'
import { getContainerMinersPosition } from '../../../app/utils/containerUtils'
import { getContainerMinersByContainerTagsQuery, getListQuery } from '../../../app/utils/queryUtils'
import { Breadcrumbs } from '../../../Components/Breadcrumbs/Breadcrumbs'
import {
  ADD_COMMENT_ACTION,
  ADD_MINER_ACTION,
  type ContainerRecord,
  DRY_COOLERS_ACTION,
  EMPTY_POSITIONS_ACTION,
  getContainerListColumns,
  getContainerModalColumns,
  GO_TO_EXPLORER_ACTION,
  GO_TO_INVENTORY_ACTION,
  GO_TO_PDU_ACTION,
  INVENTORY_LOGS_ACTION,
  MODAL_SEARCH_PARAM,
  MOVE_MINER_ACTION,
} from '../../../Components/Inventory/Containers/Containers.constants'
import { InventoryModal } from '../../../Components/Inventory/Modal/Modal'
import { Wrapper } from '../Inventory.styles'
import { SearchFilterCol } from '../Miners/Miners.styles'

import { devicesSlice, selectFilterTags } from '@/app/slices/devicesSlice'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import AppTable from '@/Components/AppTable/AppTable'
import { StyledSelect } from '@/Components/Explorer/List/ListView.styles'
import ListViewFilter from '@/Components/Explorer/List/ListViewFilter/ListViewFilter'
import { MINER_MODEL_TO_TYPE_MAP } from '@/constants/deviceConstants'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { ROUTE } from '@/constants/routes'
import { useListViewFilters } from '@/hooks/useListViewFilters'
import useTimezone from '@/hooks/useTimezone'
import { getExplorerFilterTabs } from '@/Views/Explorer/Explorer.constants'

const { setFilterTags } = devicesSlice.actions

interface ModalData {
  isOpen?: boolean
  site?: string
  container?: string
  containerName?: string
  modalName?: string
  searchText?: string
  searchProps?: string[]
  datasource?: UnknownRecord[]
  hasSubtitle?: boolean
  isLoading?: boolean
}

const InventoryContainer = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [modalData, setModalData] = useState<ModalData>({})
  const [filteredData, setFilteredData] = useState<ContainerRecord[]>([])
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null)
  const [enableMinersFetch, setEnableMinersFetch] = useState(false)
  const filterTags = useSelector(selectFilterTags)
  const { getFormattedDate } = useTimezone()

  const { data: siteData, isLoading: isSiteLoading } = useGetSiteQuery(undefined)
  const site = _capitalize(_get(siteData, ['site']))
  const { onFiltersChange, listViewFilterOptions, filters } = useListViewFilters({
    selectedType: CROSS_THING_TYPES.CONTAINER,
    site,
  })
  const { data, isLoading } = useGetListThingsQuery({
    query: getListQuery(filterTags, filters, ['t-container']),
  })

  const {
    data: containerMinersResponse,
    refetch,
    isLoading: isLoadingMiner,
  } = useGetListThingsQuery({
    query: getContainerMinersByContainerTagsQuery([`container-${modalData?.container}`]),
    fields: JSON.stringify({
      info: 1,
      rack: 1,
      type: 1,
      code: 1,
    }),
  })

  const refetchRef = useRef(refetch)

  useEffect(() => {
    if (enableMinersFetch) {
      refetchRef.current()
    }
  }, [enableMinersFetch])

  useEffect(() => {
    const miners = _head(containerMinersResponse as unknown[]) as UnknownRecord[] | undefined
    if (containerMinersResponse && miners) {
      const mappedData = _map(miners, (item: UnknownRecord) => {
        const [brandInitials, type] = _slice(_split(item.rack as string, '-'), 1, 3)
        return {
          shortCode: item.code as string,
          brand:
            _startCase(
              MINER_MODEL_TO_TYPE_MAP[brandInitials as keyof typeof MINER_MODEL_TO_TYPE_MAP],
            ) || 'Unknown',
          type: _capitalize(type as string),
          serialNumber: _get(item, 'info.serialNum') as string,
          position: _get(item, 'info.pos') as string,
        }
      })
      if (modalData.modalName === EMPTY_POSITIONS_ACTION) {
        const possiblePositions = getContainerMinersPosition(selectedContainer || '')
        const occupiedPositions = _map(miners, (item: UnknownRecord) =>
          _get(item, 'info.pos'),
        ) as string[]
        const availablePositions = _map(
          _difference(possiblePositions, occupiedPositions),
          (pos) => ({ position: pos }),
        )
        setModalData((oldData) => ({
          ...oldData,
          isLoading: isLoadingMiner,
          datasource: availablePositions,
        }))
      } else {
        setModalData((oldData) => ({
          ...oldData,
          isLoading: isLoadingMiner,
          datasource: mappedData,
        }))
      }
      setEnableMinersFetch(false)
    }
  }, [containerMinersResponse, isLoadingMiner, modalData.modalName, selectedContainer])

  useEffect(() => {
    const containers = _head(data as unknown[]) as UnknownRecord[] | undefined
    if (!isLoading && !isSiteLoading && containers?.length) {
      const mappedData =
        isLoading || isSiteLoading
          ? []
          : _map(containers, (item: UnknownRecord) => ({
              id: item?.id as string,
              container: _get(item, 'info.container') as string,
              brand: _toUpperCase(_split(item.type as string, '-')[1] as string),
              type: item?.type as string,
              site: _get(item, 'info.site') as string,
              serialNumber: _get(item, 'info.serialNum') as string,
            }))
      setFilteredData(mappedData)
    }
  }, [data, isLoading, isSiteLoading])

  const handleCloseModal = () => {
    setModalData({})
    setEnableMinersFetch(false)
    setSelectedContainer(null)
  }

  const handleModalActionSelect = (action: string) => {
    switch (action) {
      case MOVE_MINER_ACTION:
        // TO BE IMPLEMENTED
        return
      case GO_TO_INVENTORY_ACTION:
        navigate('/inventory/dashboard')
        break
      case INVENTORY_LOGS_ACTION:
        navigate('/inventory/inventory-logs')
        break
      case GO_TO_EXPLORER_ACTION:
        navigate(`${ROUTE.OPERATIONS_MINING_EXPLORER}?tab=container`)
        break
      case GO_TO_PDU_ACTION:
        navigate(
          `${ROUTE.OPERATIONS_MINING_EXPLORER}/containers/container-${modalData.container}/pdu`,
        )
        break
      case ADD_MINER_ACTION:
        // TO BE IMPLEMENTED
        break
      case ADD_COMMENT_ACTION:
        // TO BE IMPLEMENTED
        break
      default:
        break
    }
  }

  const handleActionSelect = (selected: ContainerRecord, key: string) => {
    setSelectedContainer(selected.type)
    if (key === GO_TO_EXPLORER_ACTION) {
      navigate(`${ROUTE.OPERATIONS_MINING_EXPLORER}?tab=container`)
    }
    if (key === INVENTORY_LOGS_ACTION) {
      navigate('/inventory/inventory-logs')
    }
    if (key !== DRY_COOLERS_ACTION) {
      setModalData({
        isOpen: true,
        site: selected.site,
        container: selected.container,
        containerName: _startCase(_toLower(_replace(selected.container, /-/g, ' '))),
        modalName: key,
        ...(MODAL_SEARCH_PARAM[key as keyof typeof MODAL_SEARCH_PARAM] || {}),
      })
      setEnableMinersFetch(true)
    }
  }

  const selectedTypeInfo =
    _find(getExplorerFilterTabs(getFormattedDate), ({ key }) => key === 'container') ||
    getExplorerFilterTabs(getFormattedDate)[0]

  const handleSearch = (value: unknown) => {
    dispatch(setFilterTags(value as string[]))
  }

  return (
    <Wrapper>
      <Breadcrumbs title={'Containers Inventory'} destination={'/inventory/dashboard'} />

      <SearchFilterCol>
        <ListViewFilter
          options={listViewFilterOptions}
          onChange={onFiltersChange}
          localFilters={filters}
        />
        <StyledSelect
          mode="tags"
          placeholder="Search"
          onChange={handleSearch}
          tokenSeparators={[',']}
          value={filterTags}
          options={selectedTypeInfo.searchOptions}
        />
      </SearchFilterCol>
      <AppTable<ContainerRecord>
        $fullSize
        dataSource={filteredData}
        columns={getContainerListColumns(handleActionSelect)}
        loading={isLoading || isSiteLoading}
        scroll={{ x: 'max-content', y: 380 }}
        pagination={{
          showSizeChanger: true,
        }}
      />
      {modalData.isOpen && (
        <InventoryModal
          isOpen={modalData.isOpen}
          onClose={handleCloseModal}
          site={modalData.site || ''}
          containerName={modalData.containerName || ''}
          modalName={modalData.modalName || ''}
          searchText={modalData.searchText || ''}
          searchProps={modalData.searchProps || []}
          data={modalData.datasource || []}
          columns={
            getContainerModalColumns(modalData.modalName || '', handleModalActionSelect) as never
          }
          hasSubtitle={modalData.hasSubtitle}
          isLoading={modalData.isLoading}
        />
      )}
    </Wrapper>
  )
}

export default InventoryContainer
