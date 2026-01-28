import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useLazyGetUserPermissionsQuery } from '../app/services/api'
import { authSlice, selectPermissions, selectToken } from '../app/slices/authSlice'
import { checkPermission, type AuthConfig } from '../app/utils/authUtils'

import type { PermissionCheck } from './hooks.types'

import type { RootState } from '@/types/redux'

export const { setToken, setPermissions } = authSlice.actions

export const useIsRevenueReportEnabled = (): boolean =>
  useCheckPerm({
    cap: 'revenue',
  })

export const useIsFeatureEditingEnabled = (): boolean =>
  useCheckPerm({
    cap: 'features',
  })

interface UseTokenPermissionsReturn {
  fetchPermissions: VoidFunction
}

export const useTokenPermissions = (): UseTokenPermissionsReturn => {
  const dispatch = useDispatch()
  const authToken = useSelector(selectToken)
  const [requestPermissions] = useLazyGetUserPermissionsQuery()

  const fetchPermissions = (): void => {
    const getPermissions = async (): Promise<void> => {
      try {
        const response = (await requestPermissions({}).unwrap()) as { permissions?: unknown }
        dispatch(setPermissions(response.permissions))
      } catch (error) {
        dispatch(setPermissions(null))
        throw error
      }
    }

    if (!authToken) {
      dispatch(setPermissions(null))
      return
    }

    getPermissions()
  }

  // Note: React Compiler automatically memoizes fetchPermissions, so this won't cause infinite loops
  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  return {
    fetchPermissions,
  }
}

export const useCheckPerm = ({ perm, write, cap }: PermissionCheck): boolean => {
  const config = useSelector((state: RootState) => selectPermissions(state)) as unknown
  return checkPermission(config as AuthConfig | null | undefined, { perm, write, cap })
}
