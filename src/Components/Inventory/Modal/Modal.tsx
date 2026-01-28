import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _some from 'lodash/some'
import _toLower from 'lodash/toLower'
import { type FC, useEffect, useState } from 'react'

import { FilterWrapper } from '../../../Views/Inventory/Inventory.styles'

import { StyledModal, GreenText } from './Modal.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import AppTable from '@/Components/AppTable/AppTable'

interface InventoryModalProps {
  isOpen: boolean
  onClose: () => void
  site: string
  containerName: string
  modalName: string
  hasSubtitle?: boolean
  searchText: string
  searchProps: string[]
  data?: Array<Record<string, unknown>>
  columns: Array<Record<string, unknown>>
  isLoading?: boolean
}

const InventoryModal: FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  site,
  containerName,
  modalName,
  hasSubtitle,
  searchText,
  searchProps,
  data = [],
  columns,
  isLoading,
}) => {
  const [filteredData, setFilteredData] = useState(data)

  const handleFilterSelect = (e: { target: { value: string } }) => {
    const selected = e.target.value
    const subset = _filter(data, (item: Record<string, unknown>) =>
      _some(searchProps, (prop: string) =>
        _includes(_toLower(String(item[prop] ?? '')), _toLower(selected)),
      ),
    )
    setFilteredData(subset)
  }

  useEffect(() => {
    setFilteredData(data)
  }, [data])

  return (
    <StyledModal
      title={
        <GreenText>
          <div>{site}</div>
          <div>
            {containerName} &gt; {modalName}
          </div>
        </GreenText>
      }
      open={isOpen}
      footer={false}
      onCancel={onClose}
    >
      {hasSubtitle && (
        <GreenText $margin={20}>
          Total {data.length} {modalName}
        </GreenText>
      )}

      <FilterWrapper
        $fullWidth={true}
        placeholder={`Search by ${searchText}`}
        onChange={handleFilterSelect}
        allowClear
      />

      <AppTable
        scroll={{ x: 'max-content', y: 300 }}
        dataSource={filteredData as readonly UnknownRecord[]}
        columns={columns as import('antd/es/table').ColumnType<UnknownRecord>[]}
        loading={isLoading}
        pagination={{
          showSizeChanger: true,
        }}
      />
    </StyledModal>
  )
}

export { InventoryModal }
