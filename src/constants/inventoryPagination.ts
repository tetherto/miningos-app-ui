/**
 * Constants for Inventory table pagination persistence
 */

export const INVENTORY_PAGINATION_STORAGE_KEYS = {
  REPAIRS: 'inventory-repairs-pagination',
  MINERS: 'inventory-miners-pagination',
  SPARE_PARTS: 'inventory-spare-parts-pagination',
  MOVEMENTS: 'inventory-movements-pagination',
} as const

export const INVENTORY_DEFAULT_PAGE_SIZE = 10
