import _find from 'lodash/find'
import _head from 'lodash/head'
import { useSelector } from 'react-redux'

import { selectToken } from '../app/slices/authSlice'
import { getRolesFromAuthToken } from '../app/utils/tokenUtils'
import { MULTI_SITE_USER_ROLES, USER_ROLES } from '../Components/Settings/UserManagement/constants'

import { useGetFeatureConfigQuery } from '@/app/services/api'
import type { RootState } from '@/types/redux'

interface UserRole {
  label: string
  value: string
}

const EMPTY_ROLES: UserRole[] = []

interface UseAppUserRolesReturn {
  isLoading: boolean
  userRoles: UserRole[]
}

export const useAppUserRoles = (): UseAppUserRolesReturn => {
  const authToken = useSelector(selectToken)
  const { data: featureConfig, isLoading } = useGetFeatureConfigQuery(undefined, {
    skip: !authToken,
  })
  const { isMultiSiteModeEnabled } = (featureConfig as { isMultiSiteModeEnabled?: boolean }) || {}

  let userRoles = EMPTY_ROLES
  if (!isLoading) {
    userRoles = isMultiSiteModeEnabled ? MULTI_SITE_USER_ROLES : USER_ROLES
  }

  return {
    isLoading,
    userRoles,
  }
}

interface UseUserRoleReturn {
  label: string
  value: string
}

export const useUserRole = (): UseUserRoleReturn => {
  const { userRoles } = useAppUserRoles()
  const authToken = useSelector((state: RootState) => selectToken(state))
  const userRole = authToken ? _head(getRolesFromAuthToken(authToken)) : null
  const userRoleObject = userRole ? _find(userRoles, { value: userRole }) : undefined

  return {
    label: userRoleObject?.label || '',
    value: userRoleObject?.value || '',
  }
}
