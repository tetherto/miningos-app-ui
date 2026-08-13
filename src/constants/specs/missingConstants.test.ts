import { describe, it, expect } from 'vitest'

import { AUTH_CAPS } from '../authCaps.constants'
import {
  INVENTORY_DEFAULT_PAGE_SIZE,
  INVENTORY_PAGINATION_STORAGE_KEYS,
} from '../inventoryPagination'
import { CONSUMPTION_NOMINAL_VALUE_W } from '../nominalValues'

describe('authCaps.constants', () => {
  it('exports AUTH_CAPS with expected keys', () => {
    expect(AUTH_CAPS).toBeDefined()
    expect(AUTH_CAPS.miner).toBe('m')
    expect(AUTH_CAPS.container).toBe('c')
    expect(AUTH_CAPS.revenue).toBe('r')
  })
})

describe('nominalValues', () => {
  it('exports CONSUMPTION_NOMINAL_VALUE_W', () => {
    expect(CONSUMPTION_NOMINAL_VALUE_W).toBe(22500000)
  })
})

describe('inventoryPagination', () => {
  it('exports INVENTORY_PAGINATION_STORAGE_KEYS', () => {
    expect(INVENTORY_PAGINATION_STORAGE_KEYS).toBeDefined()
    expect(INVENTORY_PAGINATION_STORAGE_KEYS.REPAIRS).toBe('inventory-repairs-pagination')
    expect(INVENTORY_PAGINATION_STORAGE_KEYS.MINERS).toBe('inventory-miners-pagination')
  })

  it('exports INVENTORY_DEFAULT_PAGE_SIZE', () => {
    expect(INVENTORY_DEFAULT_PAGE_SIZE).toBe(10)
  })
})
