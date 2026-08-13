import { useCallback, useEffect, useState } from 'react'

export interface UseInventoryPaginationOptions {
  storageKey: string
  defaultPageSize?: number
}

export interface InventoryPaginationState {
  current: number
  pageSize: number
  showSizeChanger: boolean
  pageSizeOptions: string[]
}

interface UseInventoryPaginationReturn {
  pagination: InventoryPaginationState
  handlePaginationChange: (page: number, pageSize: number) => void
}

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100']

/**
 * Loads the stored page size from sessionStorage
 */
const loadStoredPageSize = (storageKey: string, defaultPageSize: number): number => {
  try {
    const stored = sessionStorage.getItem(storageKey)
    if (stored) {
      const parsed = parseInt(stored, 10)
      if (!isNaN(parsed) && parsed > 0) {
        return parsed
      }
    }
  } catch {
    // Silently fail if sessionStorage is not available
  }
  return defaultPageSize
}

/**
 * Saves the page size to sessionStorage
 */
const savePageSize = (storageKey: string, pageSize: number): void => {
  try {
    sessionStorage.setItem(storageKey, String(pageSize))
  } catch {
    // Silently fail if sessionStorage is not available (quota exceeded, disabled, etc.)
  }
}

/**
 * Hook for managing inventory table pagination with session persistence.
 * Each table can maintain its own page size independently using a unique storageKey.
 *
 * @param options - Configuration options
 * @param options.storageKey - Unique key for storing this table's pagination in sessionStorage
 * @param options.defaultPageSize - Default page size if no stored value exists (defaults to 10)
 *
 * @returns Pagination state and change handler compatible with Ant Design Table
 *
 * @example
 * ```tsx
 * const { pagination, handlePaginationChange } = useInventoryPagination({
 *   storageKey: 'inventory-repairs-pagination',
 *   defaultPageSize: 10
 * })
 *
 * <AppTable
 *   pagination={{
 *     ...pagination,
 *     onChange: handlePaginationChange
 *   }}
 * />
 * ```
 */
export const useInventoryPagination = ({
  storageKey,
  defaultPageSize = DEFAULT_PAGE_SIZE,
}: UseInventoryPaginationOptions): UseInventoryPaginationReturn => {
  const [pagination, setPagination] = useState<InventoryPaginationState>(() => ({
    current: 1,
    pageSize: loadStoredPageSize(storageKey, defaultPageSize),
    showSizeChanger: true,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
  }))

  // Save page size to sessionStorage whenever it changes
  useEffect(() => {
    savePageSize(storageKey, pagination.pageSize)
  }, [storageKey, pagination.pageSize])

  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => {
      // If page size changed, reset to page 1
      // Otherwise, update to the selected page
      if (prev.pageSize !== pageSize) {
        return {
          ...prev,
          current: 1,
          pageSize,
        }
      }
      return {
        ...prev,
        current: page,
      }
    })
  }, [])

  return {
    pagination,
    handlePaginationChange,
  }
}

export default useInventoryPagination
