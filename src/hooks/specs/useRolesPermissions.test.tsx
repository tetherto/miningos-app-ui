import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useRolesPermissions } from '../useRolesPermissions'

vi.mock('@/app/services/api', () => ({
  useGetRolesPermissionsQuery: () => ({
    data: { roles: { admin: ['read:full', 'write:full'] } },
    isLoading: false,
    isError: false,
  }),
}))

describe('useRolesPermissions', () => {
  it('returns permissions, roles, permissionLabels, isLoading, isError', () => {
    const { result } = renderHook(() => useRolesPermissions())
    expect(result.current).toHaveProperty('permissions')
    expect(result.current).toHaveProperty('roles')
    expect(result.current).toHaveProperty('permissionLabels')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isError')
  })
})
