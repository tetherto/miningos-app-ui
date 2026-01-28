import type { TablePaginationConfig } from 'antd/es/table'
import type { FilterValue, SorterResult, TableCurrentDataSource } from 'antd/es/table/interface'
import _map from 'lodash/map'
import { FC } from 'react'

import { useGetExtDataQuery } from '../../app/services/api'
import {
  convertEnergyToRange,
  getExtDataGroupRange,
  getRangeStatsKey,
  transformStatsHistoryData,
} from '../../app/utils/electricityUtils'
import { getKunaEnergyAggr } from '../../app/utils/reportingToolsUtils'
import { DATE_RANGE } from '../../constants'
import usePagination from '../../hooks/usePagination'
import useTimezone from '../../hooks/useTimezone'

import { formatValue } from './ConsumedVsAvailableEnergy.utils'

import { UnknownRecord } from '@/app/utils/deviceUtils/types'
import AppTable from '@/Components/AppTable/AppTable'

interface DateRange {
  start: number
  end: number
}

interface ConsumedConfig {
  label: string
  propName: string
}

interface ConsumedVsAvailableEnergyTableProps {
  dateRange?: DateRange
  range?: string
  consumedConfig?: ConsumedConfig
}

export const ConsumedVsAvailableEnergyTable: FC<ConsumedVsAvailableEnergyTableProps> = ({
  dateRange = { start: 0, end: 0 },
  range = '',
  consumedConfig = { label: '', propName: '' },
}) => {
  const { getFormattedDate } = useTimezone()

  const { pagination, setPagination } = usePagination()

  const statsHistoryQuery = {
    type: 'electricity',
    query: JSON.stringify({
      key: 'stats-history',
      start: dateRange.start,
      end: dateRange.end,
      groupRange: getExtDataGroupRange(
        range as '1m' | '5m' | '15m' | '30m' | '1h' | '3h' | '1D' | '1W' | '1M',
      ),
      dataInterval: (getRangeStatsKey(
        range as '1m' | '5m' | '15m' | '30m' | '1h' | '3h' | '1D' | '1W' | '1M',
      ) === DATE_RANGE.H1
        ? '1h'
        : '15min') as '1m' | '5m' | '15m' | '30m' | '1h' | '3h' | '1D' | '1W' | '1M',
    }),
  }

  const { data: rawTailLogData, isLoading } = useGetExtDataQuery(statsHistoryQuery)

  const tailLogData = transformStatsHistoryData(rawTailLogData)

  interface ConvertedDataItem {
    ts: number
    [key: string]: unknown
  }

  const tableData: UnknownRecord[] = (() => {
    const kunaAggrData = getKunaEnergyAggr(tailLogData)
    const convertedData = convertEnergyToRange(kunaAggrData)
    const records = _map(convertedData, (item: ConvertedDataItem, index: number) => ({
      key: index,
      ts: item.ts,
      [consumedConfig.label]: item[consumedConfig.propName],
    })) as unknown as UnknownRecord[]
    return records
  })()

  const getSiteEnergyTableColumns = () => [
    {
      title: 'Time',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: UnknownRecord, b: UnknownRecord) => (a.ts as number) - (b.ts as number),
      render: (_text: unknown, record: UnknownRecord) =>
        `${getFormattedDate(new Date(record.ts as number))}`,
      defaultSortOrder: 'descend' as const,
    },
    {
      title: consumedConfig.label,
      key: consumedConfig.label,
      render: (record: UnknownRecord) => formatValue(record[consumedConfig.label] as number),
    },
  ]

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    _sorter: SorterResult<UnknownRecord> | SorterResult<UnknownRecord>[],
    extra: TableCurrentDataSource<UnknownRecord>,
  ) => {
    if (extra.action === 'paginate' && pagination.current && pagination.pageSize) {
      setPagination({
        current: pagination.current,
        pageSize: pagination.pageSize,
        showSizeChanger: true,
        total: pagination.total ?? 0,
      })
    }
  }

  return (
    <AppTable
      rowKey={(record: unknown) => (record as { key: string }).key}
      dataSource={tableData}
      columns={getSiteEnergyTableColumns()}
      loading={isLoading}
      pagination={pagination}
      onChange={handleTableChange}
    />
  )
}
