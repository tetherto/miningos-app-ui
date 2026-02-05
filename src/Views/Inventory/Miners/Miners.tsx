import _capitalize from 'lodash/capitalize'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _map from 'lodash/map'
import _split from 'lodash/split'
import _startCase from 'lodash/startCase'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

import { useGetListThingsQuery, useGetSiteQuery } from '../../../app/services/api'
import { devicesSlice, selectFilterTags } from '../../../app/slices/devicesSlice'
import { Breadcrumbs } from '../../../Components/Breadcrumbs/Breadcrumbs'
import AddMinerModal from '../../../Components/Inventory/Miners/AddMinerModal/AddMinerModal'
import MinerInfoModal from '../../../Components/Inventory/Miners/MinerInfoModal/MinerInfoModal'
import {
  ADD_COMMENT_ACTION,
  DELETE_MINER,
  GO_TO_EXPLORER_ACTION,
  INVENTORY_LOGS_ACTION,
  type Miner,
  MOVE_MINER,
  REPAIR,
} from '../../../Components/Inventory/Miners/Miners.constants'
import MoveMinerModal from '../../../Components/Inventory/Miners/MoveMinerModal/MoveMinerModal'
import { useContextualModal } from '../../../hooks/useContextualModal'
import { HeaderWrapper, StyledButton, Wrapper } from '../Inventory.styles'

import { StyledFilterWrapper, StyledRow } from './Miners.styles'

import { getContainerName } from '@/app/utils/containerUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { getListQuery } from '@/app/utils/queryUtils'
import AppTable from '@/Components/AppTable/AppTable'
import { CommentsModal } from '@/Components/CommentsModal/CommentsModal'
import { FilterRow, StyledSelect } from '@/Components/Explorer/List/ListView.styles'
import ListViewFilter from '@/Components/Explorer/List/ListViewFilter/ListViewFilter'
import ConfirmDeleteMinerModal from '@/Components/Inventory/Miners/ConfirmDeleteMinerModal/ConfirmDeleteMinerModal'
import { getMinerListColumns } from '@/Components/Inventory/Miners/Miners.helpers'
import { Spinner } from '@/Components/Spinner/Spinner'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'
import { MINER_MODEL_TO_TYPE_MAP } from '@/constants/deviceConstants'
import { CROSS_THING_TYPES } from '@/constants/devices'
import {
  INVENTORY_DEFAULT_PAGE_SIZE,
  INVENTORY_PAGINATION_STORAGE_KEYS,
} from '@/constants/inventoryPagination'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '@/constants/permissions.constants'
import { ROUTE } from '@/constants/routes'
import useInventoryPagination from '@/hooks/useInventoryPagination'
import { useListViewFilters } from '@/hooks/useListViewFilters'
import { useCheckPerm } from '@/hooks/usePermissions'
import useTimezone from '@/hooks/useTimezone'
import { getExplorerFilterTabs } from '@/Views/Explorer/Explorer.constants'

const { setFilterTags } = devicesSlice.actions

const minerWritePerm = `${AUTH_PERMISSIONS.MINER}:${AUTH_LEVELS.WRITE}`

const DATA_REFRESH_DELAY_MS = 5 * 1000

const INVALID_INVENTORY_MINER_FILTER_KEYS = [
  'last.snap.stats.status', // Status
  'last.snap.config.power_mode', // Power Mode
]

const InventoryMiners = () => {
  const canEditMiner = useCheckPerm({ perm: minerWritePerm })
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { getFormattedDate } = useTimezone()

  const [filteredItems, setFilteredItems] = useState<Miner[]>([])
  const deletedMinersRef = useRef<Map<string, Miner>>(new Map())
  const refreshTimeoutIdRef = useRef<number | null>(null)
  const { pagination, handlePaginationChange } = useInventoryPagination({
    storageKey: INVENTORY_PAGINATION_STORAGE_KEYS.MINERS,
    defaultPageSize: INVENTORY_DEFAULT_PAGE_SIZE,
  })

  const { data: siteData, isLoading: isSiteLoading } = useGetSiteQuery(undefined)
  const site = _capitalize(_get(siteData, ['site']))
  const { onFiltersChange, listViewFilterOptions, filters } = useListViewFilters({
    selectedType: CROSS_THING_TYPES.MINER,
    site,
  })

  // Inventory miners do not have reliable runtime status/power-mode (unknown is common),
  // so remove those filters and ensure they can never affect the query.
  const inventoryMinersFilterOptions = useMemo(
    () =>
      _filter(
        listViewFilterOptions,
        (option) => !_includes(INVALID_INVENTORY_MINER_FILTER_KEYS, option.value as string),
      ),
    [listViewFilterOptions],
  )

  const inventoryMinersFilters = useMemo(() => {
    if (!filters) return filters
    const next = { ...filters }
    _forEach(INVALID_INVENTORY_MINER_FILTER_KEYS, (key) => {
      delete (next as Record<string, unknown>)[key]
    })
    return next
  }, [filters])

  const filterTags = useSelector(selectFilterTags)

  const selectedTypeInfo =
    _find(getExplorerFilterTabs(getFormattedDate), ({ key }) => key === 'miner') ||
    getExplorerFilterTabs(getFormattedDate)[0]

  useEffect(
    () => () => {
      if (refreshTimeoutIdRef.current) {
        clearTimeout(refreshTimeoutIdRef.current)
      }
    },
    [],
  )

  const {
    data,
    isLoading: isLoadingMiners,
    refetch,
    isFetching: isFetchingMiners,
  } = useGetListThingsQuery({
    overwriteCache: true,
    query: getListQuery(filterTags, inventoryMinersFilters, ['t-miner']),
    fields: JSON.stringify({
      id: 1,
      type: 1,
      info: 1,
      code: 1,
      tags: 1,
      comments: 1,
      rack: 1,
    }),
  })

  const {
    modalOpen: moveMinerModalOpen,
    handleOpen: openMoveMinerModal,
    handleClose: closeMoveMinerModal,
    subject: moveMinerRequest,
  } = useContextualModal({
    onClose: () => {
      refreshTimeoutIdRef.current = window.setTimeout(refetch, DATA_REFRESH_DELAY_MS)
    },
  })

  const {
    modalOpen: addMinerModalOpen,
    handleOpen: openAddMinerModal,
    handleClose: closeAddMinerModal,
  } = useContextualModal({
    onClose: () => {
      refetch()
    },
  })

  const {
    modalOpen: minerInfoModalOpen,
    handleOpen: openMinerInfoModal,
    handleClose: closeMinerInfoModal,
    subject: minerToShowInfo,
  } = useContextualModal({
    onClose: () => {
      refetch()
    },
  })

  const {
    modalOpen: commentsModalOpen,
    handleOpen: openCommentsModal,
    handleClose: closeCommentsModal,
    subject: minerToShowComments,
  } = useContextualModal({
    onClose: () => {
      refetch()
    },
  })

  const {
    modalOpen: confirmDeleteMinerModalOpen,
    handleOpen: openConfirmDeleteMinerModal,
    handleClose: closeConfirmDeleteMinerModal,
    subject: minerToDelete,
  } = useContextualModal({
    onClose: () => {
      // Clear any pending optimistic deletes on modal close (success case)
      if (minerToDelete && typeof minerToDelete === 'object' && 'id' in minerToDelete) {
        const miner = minerToDelete as Miner
        if (miner.id) {
          deletedMinersRef.current.delete(miner.id)
        }
      }
      refetch()
    },
  })

  const handleActionSelect = (minerSelected: Miner, action: string) => {
    switch (action) {
      case MOVE_MINER:
        openMoveMinerModal({ miner: minerSelected })
        break

      case REPAIR:
        openMinerInfoModal(minerSelected)
        break

      case INVENTORY_LOGS_ACTION:
        navigate(`/inventory/movements/${minerSelected.id}`)
        break

      case GO_TO_EXPLORER_ACTION:
        dispatch(setFilterTags([`code-${minerSelected.code}`]))
        navigate(`${ROUTE.OPERATIONS_MINING_EXPLORER}?tab=miner`)
        break

      case ADD_COMMENT_ACTION:
        openCommentsModal(minerSelected.raw)
        break

      case DELETE_MINER:
        openConfirmDeleteMinerModal(minerSelected)
        break

      default:
        break
    }
  }

  const handleStatusChange = (minerSelected: Miner, newStatus: string) => {
    openMoveMinerModal({
      miner: minerSelected,
      values: {
        status: newStatus,
      },
    })
  }

  const handleLocationChange = (minerSelected: Miner, newLocation: string) => {
    openMoveMinerModal({
      miner: minerSelected,
      values: {
        location: newLocation,
      },
    })
  }

  const handleOptimisticDelete = useCallback((minerId: string) => {
    setFilteredItems((prevItems) => {
      const minerToDelete = prevItems.find((miner) => miner.id === minerId)
      if (minerToDelete) {
        deletedMinersRef.current.set(minerId, minerToDelete)
        return _filter(prevItems, (miner) => miner.id !== minerId)
      }
      return prevItems
    })
  }, [])

  const handleDeleteRestore = useCallback((minerId: string) => {
    const deletedMiner = deletedMinersRef.current.get(minerId)
    if (deletedMiner) {
      setFilteredItems((prevItems) => {
        const exists = prevItems.some((miner) => miner.id === minerId)
        if (!exists) {
          return [...prevItems, deletedMiner].sort((a, b) => {
            const aCode = a.code ?? ''
            const bCode = b.code ?? ''
            return aCode.localeCompare(bCode)
          })
        }
        return prevItems
      })
      deletedMinersRef.current.delete(minerId)
    }
  }, [])

  useEffect(() => {
    const miners = _head(data as unknown[]) as UnknownRecord[] | undefined
    if (!isLoadingMiners && _isArray(miners)) {
      const mappedItems = _map(miners, (miner: UnknownRecord) => ({
        type: miner.type as string,
        site: _get(miner, 'info.site') as string,
        pos: _get(miner, 'info.pos') as string,
        code: miner.code as string,
        tags: miner.tags as string[],
        container: getContainerName(
          (_get(miner, 'info.container') as string) ?? MAINTENANCE_CONTAINER,
          miner.type as string,
        ),
        serialNum: _get(miner, 'info.serialNum') as string,
        macAddress: _get(miner, 'info.macAddress') as string,
        location: (_get(miner, 'info.location') as string) ?? 'unknown',
        status: (_get(miner, 'info.status') as string) ?? 'unknown',
        id: miner.id as string,
        createdAt: (_get(miner, 'info.createdAt') as number) || 0,
        updatedAt: (_get(miner, 'info.updatedAt') as number) || 0,
        brand: _startCase(
          _get(MINER_MODEL_TO_TYPE_MAP, _split(miner.type as string, '-')[1] as string, 'unknown'),
        ),
        raw: miner,
      }))
      setFilteredItems(mappedItems)
    }
  }, [data, isLoadingMiners])

  const isLoading = isLoadingMiners || isFetchingMiners || isSiteLoading

  const handleSearch = (value: unknown) => {
    dispatch(setFilterTags(value as string[]))
  }

  return (
    <Wrapper>
      <HeaderWrapper>
        <Breadcrumbs title={'Miners Inventory'} destination={'/inventory/dashboard'} />
      </HeaderWrapper>

      <StyledRow>
        <StyledFilterWrapper $short={false}>
          <FilterRow>
            <ListViewFilter
              options={inventoryMinersFilterOptions}
              onChange={onFiltersChange}
              localFilters={inventoryMinersFilters}
            />
            <StyledSelect
              mode="tags"
              placeholder="Search"
              onChange={handleSearch}
              tokenSeparators={[',']}
              value={filterTags}
              options={selectedTypeInfo.searchOptions}
            />
          </FilterRow>
          <StyledButton type="primary" onClick={openAddMinerModal} disabled={!canEditMiner}>
            Register New Miner
          </StyledButton>
        </StyledFilterWrapper>
      </StyledRow>

      {isLoading ? (
        <Spinner />
      ) : (
        <AppTable<Miner>
          $fullSize
          dataSource={filteredItems}
          columns={getMinerListColumns({
            handleActionSelect,
            handleStatusChange,
            handleLocationChange,
            canEditMiner,
            getFormattedDate,
          })}
          loading={isLoading}
          scroll={{ x: 'max-content', y: 600 }}
          pagination={{
            ...pagination,
            onChange: handlePaginationChange,
          }}
        />
      )}

      {commentsModalOpen && (
        <CommentsModal
          shouldOpenImmediately
          device={minerToShowComments as never}
          onModalClose={closeCommentsModal}
        />
      )}

      {moveMinerModalOpen && (
        <MoveMinerModal
          isOpen={moveMinerModalOpen}
          onClose={closeMoveMinerModal}
          miner={(moveMinerRequest as { miner: Miner }).miner as never}
          requestedValues={(moveMinerRequest as { values?: UnknownRecord }).values}
        />
      )}

      {addMinerModalOpen && (
        <AddMinerModal isOpen={addMinerModalOpen} onClose={closeAddMinerModal} />
      )}

      {minerInfoModalOpen && (
        <MinerInfoModal
          isOpen={minerInfoModalOpen}
          onClose={closeMinerInfoModal}
          miner={minerToShowInfo as never}
        />
      )}

      {confirmDeleteMinerModalOpen && (
        <ConfirmDeleteMinerModal
          isOpen={confirmDeleteMinerModalOpen}
          onClose={closeConfirmDeleteMinerModal}
          miner={minerToDelete as never}
          onDeleteStart={handleOptimisticDelete}
          onDeleteError={handleDeleteRestore}
        />
      )}
    </Wrapper>
  )
}

export default InventoryMiners
