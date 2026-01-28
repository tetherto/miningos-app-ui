import React, { useState } from 'react'

export interface PaginationArgs {
  current?: number
  pageSize?: number
}

export interface PaginationState {
  current: number
  pageSize: number
  showSizeChanger: boolean
  total: number
}

interface UsePaginationReturn {
  pagination: PaginationState
  queryArgs: {
    limit: number
    offset: number
  }
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  hideNextPage: (size?: number) => void
}

const usePagination = (args: PaginationArgs = {}): UsePaginationReturn => {
  const { current: initialCurrent = 1, pageSize: initialPageSize = 20 } = args
  const [pagination, setPagination] = useState<PaginationState>({
    current: initialCurrent,
    pageSize: initialPageSize,
    // pageSizeOptions: [1, 2, 3],
    showSizeChanger: true,
    total: initialPageSize + 1,
  })

  const hideNextPage = (size?: number) => {
    setPagination((pagination) => {
      const { pageSize, current } = pagination
      return {
        ...pagination,
        total: pageSize * current + (size && size >= pageSize ? 1 : 0),
      }
    })
  }

  return {
    pagination,
    queryArgs: {
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize,
    },
    setPagination,
    hideNextPage,
  }
}

export default usePagination
