import { useMemo } from 'react'

import { useGetRolesPermissionsQuery } from '@/app/services/api'
import { type PermLevel } from '@/Components/Settings/RBACControl/rolePermissions'

interface ApiResponse {
  roles?: Record<string, string[]>
}

interface UseRolesPermissionsReturn {
  permissions: Record<string, Record<string, PermLevel>>
  roles: Array<{ value: string; label: string }>
  permissionLabels: Record<string, string>
  isLoading: boolean
  isError: boolean
}

const formatLabel = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export const useRolesPermissions = (): UseRolesPermissionsReturn => {
  const { data, isLoading, isError } = useGetRolesPermissionsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  })

  const response = data as ApiResponse | undefined

  const { permissions, roles, permissionLabels } = useMemo(() => {
    const apiRoles = response?.roles || {}

    const allPermKeys = new Set<string>()
    const perms: Record<string, Record<string, PermLevel>> = {}

    for (const [role, entries] of Object.entries(apiRoles)) {
      const parsed: Record<string, PermLevel> = {}
      for (const entry of entries) {
        const [key, level] = entry.split(':')
        parsed[key] = level as PermLevel
        allPermKeys.add(key)
      }
      perms[role] = parsed
    }

    const labels: Record<string, string> = {}
    for (const key of allPermKeys) {
      labels[key] = formatLabel(key)
    }

    const roleList = Object.keys(apiRoles).map((r) => ({
      value: r,
      label: formatLabel(r),
    }))

    return { permissions: perms, roles: roleList, permissionLabels: labels }
  }, [response?.roles])

  return {
    permissions,
    roles,
    permissionLabels,
    isLoading,
    isError,
  }
}
