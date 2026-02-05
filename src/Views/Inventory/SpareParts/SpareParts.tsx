import { PlusOutlined, ToTopOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import _capitalize from 'lodash/capitalize'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import _pick from 'lodash/pick'
import _size from 'lodash/size'
import _some from 'lodash/some'
import _toLower from 'lodash/toLower'
import _trim from 'lodash/trim'
import * as React from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

import { useGetListThingsQuery, useGetSiteQuery } from '../../../app/services/api'
import { getPartTypeAbbreviation } from '../../../app/utils/sparePartUtils'
import { Breadcrumbs } from '../../../Components/Breadcrumbs/Breadcrumbs'
import AddSparePartModal from '../../../Components/Inventory/SpareParts/AddSparePartModal/AddSparePartModal'
import MoveSparePartModal from '../../../Components/Inventory/SpareParts/MoveSparePartModal/MoveSparePartModal'
import {
  DELETE_SPARE_PART,
  INVENTORY_LOGS_ACTION,
  MOVE_SPARE_PART,
  NO_PARENT_DEVICE_ID,
  SEARCHABLE_SPARE_PART_ATTRIBUTES,
  SPARE_PARTS_LIST_TAB_ITEMS,
  SparePartTypes,
} from '../../../Components/Inventory/SpareParts/SpareParts.constants'
import {
  getSparePartsListColumns,
  type SparePart,
} from '../../../Components/Inventory/SpareParts/SpareParts.utils'
import { useContextualModal } from '../../../hooks/useContextualModal'
import { Wrapper } from '../Inventory.styles'

import { RegisterPartButton, StyledListViewActionCol, TabsWrapper } from './SpareParts.styles'

import { devicesSlice, selectFilterTags } from '@/app/slices/devicesSlice'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { notifyError } from '@/app/utils/NotificationService'
import { getListQuery } from '@/app/utils/queryUtils'
import AppTable from '@/Components/AppTable/AppTable'
import { CommentsModal } from '@/Components/CommentsModal/CommentsModal'
import { CommonSelect } from '@/Components/Explorer/List/ListView.styles'
import { ADD_COMMENT_ACTION } from '@/Components/Inventory/Miners/Miners.constants'
import BatchMoveSparePartsModal from '@/Components/Inventory/SpareParts/BatchMoveSparePartsModal/BatchMoveSparePartsModal'
import BulkAddSparePartsModal from '@/Components/Inventory/SpareParts/BulkAddSparePartsModal/BulkAddSparePartsModal'
import ConfirmDeleteSparePartModal from '@/Components/Inventory/SpareParts/ConfirmDeleteSparePartModal/ConfirmDeleteSparePartModal'
import { Spinner } from '@/Components/Spinner/Spinner'
import {
  INVENTORY_DEFAULT_PAGE_SIZE,
  INVENTORY_PAGINATION_STORAGE_KEYS,
} from '@/constants/inventoryPagination'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '@/constants/permissions.constants'
import useInventoryPagination from '@/hooks/useInventoryPagination'
import { useListViewFilters } from '@/hooks/useListViewFilters'
import { useCheckPerm } from '@/hooks/usePermissions'
import useTimezone from '@/hooks/useTimezone'
import { StyledButton } from '@/styles/shared-styles'
import { Device } from '@/types'

const { setFilterTags } = devicesSlice.actions

const inventoryWritePerm = `${AUTH_PERMISSIONS.MINER}:${AUTH_LEVELS.WRITE}`

const InventorySpareParts = () => {
  const { getFormattedDate } = useTimezone()
  const canEditSpareParts = useCheckPerm({ perm: inventoryWritePerm })

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState(SparePartTypes.CONTROLLER)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const filterTags = useSelector(selectFilterTags)
  const { pagination, handlePaginationChange } = useInventoryPagination({
    storageKey: INVENTORY_PAGINATION_STORAGE_KEYS.SPARE_PARTS,
    defaultPageSize: INVENTORY_DEFAULT_PAGE_SIZE,
  })

  const { data: siteData, isLoading: isSiteLoading } = useGetSiteQuery(undefined)

  const site = _capitalize(_get(siteData, ['site']))

  const { filters } = useListViewFilters({
    selectedType: 't-inventory-miner_part',
    site,
  })

  const clearSelections = () => {
    setSelectedRowKeys([])
  }

  const {
    currentData: data,
    isLoading: isSparePartsLoading,
    isFetching: isSparePartsFetching,
    refetch: refetchSpareParts,
  } = useGetListThingsQuery(
    {
      query: getListQuery(filterTags, filters, ['t-inventory-miner_part']),
      fields: JSON.stringify({
        id: 1,
        code: 1,
        comments: 1,
        rack: 1,
        info: 1,
        type: 1,
        tags: 1,
      }),
    },
    {
      refetchOnMountOrArgChange: true,
    },
  )

  const {
    modalOpen: movePartModalOpen,
    handleOpen: openMovePartModal,
    handleClose: closeMovePartModal,
    subject: sparePartMoveRequest,
  } = useContextualModal({
    onClose: () => {
      refetchSpareParts()
    },
  })

  const {
    modalOpen: addPartModalOpen,
    handleOpen: openAddPartModal,
    handleClose: closeAddPartModal,
    subject: selectedPartType,
  } = useContextualModal({
    onClose: () => {
      refetchSpareParts()
    },
  })

  const {
    modalOpen: confirmDeleteSparePartModalOpen,
    handleOpen: openConfirmDeleteSparePartModal,
    handleClose: closeConfirmDeleteSparePartModal,
    subject: sparePartToDelete,
  } = useContextualModal({
    onClose: () => {
      refetchSpareParts()
    },
  })

  const {
    modalOpen: commentsModalOpen,
    handleOpen: openCommentsModal,
    handleClose: closeCommentsModal,
    subject: sparePartToShowComments,
  } = useContextualModal({
    onClose: () => {
      refetchSpareParts()
    },
  })

  const {
    modalOpen: bulkAddPartsModalOpen,
    handleOpen: openBulkAddPartsModal,
    handleClose: closeBulkAddPartsModal,
  } = useContextualModal()

  const {
    modalOpen: batchMoveModalOpen,
    handleOpen: openBatchMoveModal,
    handleClose: closeBatchMoveModal,
    subject: sparePartsToBatchMove,
  } = useContextualModal({
    onClose: () => {
      clearSelections()
      refetchSpareParts()
    },
  })

  const handleActionSelect = (sparePartSelected: SparePart, action: string) => {
    switch (action) {
      case MOVE_SPARE_PART:
        openMovePartModal({ sparePart: sparePartSelected })
        break

      case DELETE_SPARE_PART:
        openConfirmDeleteSparePartModal(sparePartSelected)
        break

      case INVENTORY_LOGS_ACTION:
        navigate(`/inventory/movements/${sparePartSelected.id}`)
        break

      case ADD_COMMENT_ACTION:
        openCommentsModal(sparePartSelected.raw)
        break

      default:
        break
    }
  }

  const handleStatusChange = (sparePartSelected: SparePart, newStatus: string) => {
    openMovePartModal({
      sparePart: sparePartSelected,
      values: {
        status: newStatus,
      },
    })
  }

  const handleLocationChange = (sparePartSelected: SparePart, newLocation: string) => {
    openMovePartModal({
      sparePart: sparePartSelected,
      values: {
        location: newLocation,
      },
    })
  }

  const handleSelectionChange = (keys: React.Key[]) => {
    setSelectedRowKeys(keys)
  }

  const handlePageChange = (page: number, pageSize: number) => {
    clearSelections()
    handlePaginationChange(page, pageSize)
  }

  const getMappedItems = (): SparePart[] => {
    const parts = _head(data as unknown[]) as UnknownRecord[] | undefined
    if (isSparePartsLoading || !parts?.length) {
      return []
    }

    return _map(parts, (part: UnknownRecord) => ({
      part: getPartTypeAbbreviation(part.type as string),
      ..._pick(_get(part, 'info'), ['serialNum', 'macAddress', 'site', 'location', 'status']),
      code: part.code as string,
      createdAt: (_get(part, 'info.createdAt') as number) || 0,
      updatedAt: (_get(part, 'info.updatedAt') as number) || 0,
      parentDeviceId: (_get(part, 'info.parentDeviceId') as string) ?? NO_PARENT_DEVICE_ID,
      partType: part.type as string,
      type: _get(part, 'info.subType') as string,
      parentDeviceSerialNum: _get(part, 'info.parentDeviceSN') as string,
      parentDeviceCode: _get(part, 'info.parentDeviceCode') as string,
      id: part.id as string,
      raw: part,
    }))
  }

  const mappedItems = getMappedItems()

  const filteredItems = _filter(mappedItems, (item: SparePart) => {
    let selected = item.partType === selectedTab

    const filtered = _some(SEARCHABLE_SPARE_PART_ATTRIBUTES, (prop) =>
      _includes(_toLower(_get(item, prop) as string), _toLower(_trim(''))),
    )
    return selected && filtered
  })

  const handleSearch = (value: unknown) => {
    dispatch(setFilterTags(value as string[]))
  }

  const handleBatchMove = () => {
    const maxAllowed = 5
    if (_size(selectedRowKeys) > maxAllowed) {
      notifyError(`Please select not more than ${maxAllowed} parts to move`, '')
      return
    }

    const selectedSparePartSet = new Set(selectedRowKeys)
    const selectedSpareParts = _filter(filteredItems, ({ id }) =>
      selectedSparePartSet.has(id ?? ''),
    )
    openBatchMoveModal(selectedSpareParts)
  }

  const isLoading = isSparePartsLoading || isSparePartsFetching || isSiteLoading

  const renderTabs = _map(SPARE_PARTS_LIST_TAB_ITEMS, ({ key, label }) => (
    <StyledButton onClick={() => setSelectedTab(key)} $isActive={selectedTab === key} key={key}>
      {label}
    </StyledButton>
  ))

  const isBatchMoveEnabled = _size(selectedRowKeys) >= 2 && canEditSpareParts

  return (
    <Wrapper>
      <Row>
        <Col flex="auto">
          <Breadcrumbs title={'Spare Parts Inventory'} destination={'/inventory/dashboard'} />
        </Col>
        <StyledListViewActionCol md={20} lg={12} xl={10} xxl={8}>
          <CommonSelect
            mode="tags"
            placeholder="Search parts"
            onChange={handleSearch}
            tokenSeparators={[',']}
            value={filterTags}
            options={[]}
          />
          <Button onClick={openBulkAddPartsModal} disabled={!canEditSpareParts}>
            Bulk register
          </Button>

          <Button icon={<ToTopOutlined />} onClick={handleBatchMove} disabled={!isBatchMoveEnabled}>
            Move
          </Button>
          <RegisterPartButton
            onClick={() => openAddPartModal(selectedTab)}
            disabled={!canEditSpareParts}
          >
            <PlusOutlined />
            Register Part
          </RegisterPartButton>
        </StyledListViewActionCol>
      </Row>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <TabsWrapper>{renderTabs}</TabsWrapper>
          <AppTable<SparePart>
            $fullSize
            dataSource={filteredItems}
            columns={getSparePartsListColumns({
              handleActionSelect,
              handleStatusChange,
              handleLocationChange,
              selectedTab,
              getFormattedDate,
            })}
            loading={isSparePartsLoading}
            scroll={{ x: 'max-content', y: 600 }}
            pagination={{
              ...pagination,
              onChange: handlePageChange,
            }}
            rowKey="id"
            rowSelection={{
              selectedRowKeys,
              onChange: handleSelectionChange,
            }}
          />
        </>
      )}

      {commentsModalOpen && (
        <CommentsModal
          shouldOpenImmediately
          device={sparePartToShowComments as Device}
          onModalClose={closeCommentsModal}
        />
      )}

      {movePartModalOpen && (
        <MoveSparePartModal
          isOpen={movePartModalOpen}
          onClose={closeMovePartModal}
          sparePart={(sparePartMoveRequest as { sparePart: SparePart }).sparePart as never}
          requestedValues={(sparePartMoveRequest as { values?: UnknownRecord }).values}
        />
      )}

      {addPartModalOpen && (
        <AddSparePartModal
          isOpen={addPartModalOpen}
          onClose={closeAddPartModal}
          selectedPartType={selectedPartType as string | undefined}
        />
      )}

      {bulkAddPartsModalOpen && (
        <BulkAddSparePartsModal isOpen={bulkAddPartsModalOpen} onClose={closeBulkAddPartsModal} />
      )}

      {confirmDeleteSparePartModalOpen && (
        <ConfirmDeleteSparePartModal
          isOpen={confirmDeleteSparePartModalOpen}
          onClose={closeConfirmDeleteSparePartModal}
          sparePart={sparePartToDelete as never}
        />
      )}

      {batchMoveModalOpen && (
        <BatchMoveSparePartsModal
          isOpen={batchMoveModalOpen}
          onClose={closeBatchMoveModal}
          spareParts={sparePartsToBatchMove as never}
        />
      )}
    </Wrapper>
  )
}

export default InventorySpareParts
