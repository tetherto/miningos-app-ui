import AppTable from '@/Components/AppTable/AppTable'
import { Spinner } from '@/Components/Spinner/Spinner'
import type { TableColumn } from '@/types'

interface InventoryTableProps {
  data?: unknown[]
  columns?: TableColumn[]
  isLoading?: boolean
}

const InventoryTable = ({ data = [], columns, isLoading }: InventoryTableProps) => {
  if (isLoading) {
    return <Spinner />
  }

  return (
    <AppTable
      dataSource={
        Array.isArray(data)
          ? (data as readonly import('@/app/utils/deviceUtils/types').UnknownRecord[])
          : []
      }
      columns={columns}
      loading={isLoading}
      pagination={false}
    />
  )
}

export { InventoryTable }
