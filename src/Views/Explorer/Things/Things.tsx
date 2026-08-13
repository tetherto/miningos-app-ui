import Result from 'antd/es/result'
import Spin from 'antd/es/spin'
import type { TableProps } from 'antd/es/table'
import _endsWith from 'lodash/endsWith'
import _head from 'lodash/head'
import _size from 'lodash/size'
import _trimEnd from 'lodash/trimEnd'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import columns, { type ThingData } from './Things.columns'

import { useGetListThingsQuery } from '@/app/services/api'
import { getByTagsQuery } from '@/app/utils/queryUtils'
import AppTable from '@/Components/AppTable/AppTable'
import { POLLING_20s } from '@/constants/pollingIntervalConstants'
import usePagination, { PaginationState } from '@/hooks/usePagination'
import { useSmartPolling } from '@/hooks/useSmartPolling'

const toSingular = (tag: string) => (_endsWith(tag, 's') ? _trimEnd(tag, 's') : tag)

const Things = () => {
  const smartPolling20s = useSmartPolling(POLLING_20s)
  const { tag } = useParams()
  const { pagination, queryArgs, setPagination, hideNextPage } = usePagination()
  const { current } = pagination
  const listThingsQuery = useGetListThingsQuery(
    {
      ...queryArgs,
      query: getByTagsQuery([toSingular(`t-${tag}`)]),
    },
    {
      pollingInterval: smartPolling20s,
    },
  )

  const listData = (listThingsQuery.data as Record<string, unknown>[][] | undefined) ?? []

  const { isLoading, isFetching, isError } = listThingsQuery

  const size = _size(_head(listData))

  useEffect(() => {
    hideNextPage(size)
  }, [hideNextPage, size, current])

  const handleTableChange: TableProps<ThingData>['onChange'] = (
    pagination,
    _filters,
    _sorter,
    { action },
  ) => {
    if (action === 'paginate') {
      setPagination(pagination as PaginationState)
    }
  }

  if (isLoading) return <Spin />
  if (isError)
    return (
      <Result
        status="500"
        title="500"
        subTitle="Sorry, something went wrong."
        extra={<Link to="/">Back Home</Link>}
      />
    )
  return (
    <AppTable<ThingData>
      dataSource={(_head(listData) as ThingData[] | undefined) ?? []}
      columns={columns}
      pagination={pagination}
      loading={isFetching}
      onChange={handleTableChange}
    />
  )
}

export default Things
